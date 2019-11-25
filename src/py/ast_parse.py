from redbaron import RedBaron
from enum import Enum


class DependencyTypes(Enum):
    COMPOSITION_MANIPULATION = 0
    COMPOSITION = 1
    MECHANISM = 2
    PROJECTION = 3
    PERIPHERAL_DEPENDENCY = 4


class _DependencyNode:
    def __init__(self, fst_node, node_type):
        self.dependencies = []
        self.dependents = []
        self.node_type = node_type
        self.fst_node = fst_node

    def add_dependencies(self, dependencies):
        try:
            for d in iter(dependencies):
                self.add_dependency(d)
                d.add_dependent(self)
        except TypeError:
            d = dependencies
            self.add_dependency(d)
            d.add_dependent(self)

    def add_dependents(self, dependents):
        try:
            for d in iter(dependents):
                self.add_dependent(d)
                d.add_dependency(self)
        except TypeError:
            d = dependents
            self.add_dependent(d)
            d.add_dependency(self)

    def add_dependency(self, dependency):
        if not dependency in self.dependencies:
            self.dependencies.append(dependency)

    def add_dependent(self, dependent):
        if not dependent in self.dependents:
            self.dependents.append(dependent)

    def __repr__(self):
        return self.fst_node.dumps()


class DependencyGraph:
    def __init__(self, src, psyneulink_instance):
        self.psyneulink_instance = psyneulink_instance
        self.psyneulink_composition_classes = self.get_class_hierarchy(self.psyneulink_instance.Composition)
        self.psyneulink_mechanism_classes = self.get_class_hierarchy(self.psyneulink_instance.Mechanism)
        self.psyneulink_projection_classes = self.get_class_hierarchy(self.psyneulink_instance.Projection)
        self.psyneulink_function_classes = self.get_class_hierarchy(self.psyneulink_instance.Function)
        self.imports = []
        self.path_operations = []
        self._assignments = {}
        self._compositions = set()
        self._composition_manipulations = set()
        self._mechanisms = set()
        self._projections = set()
        self._mechanism_dependencies = set()
        self._peripheral_dependencies = set()
        self._dependency_method_map = {
            DependencyTypes.COMPOSITION: self.add_composition,
            DependencyTypes.COMPOSITION_MANIPULATION: self.add_composition_manipulation,
            DependencyTypes.MECHANISM: self.add_mechanism,
            DependencyTypes.PROJECTION: self.add_projection,
            DependencyTypes.PERIPHERAL_DEPENDENCY: self.add_peripheral_dependency,
        }
        self.index = {}
        self.fst = ''
        self.fluid_fst = ''
        self.graph_dict = ''
        self.fst = RedBaron(src)
        self.all_assigns = self.fst.find_all('assign')
        self.all_assigns_dict = {k: v for k, v in [(i.name.value, i) for i in self.all_assigns]}
        self.src_executed = ''
        self.parse_fst()

    def get_class_hierarchy(self, root_class, class_hierarchy=None):
        if class_hierarchy is None:
            class_hierarchy = [root_class.__name__]
        subclasses = root_class.__subclasses__()
        if subclasses:
            class_hierarchy.extend([i.__name__ for i in subclasses])
            for subclass in subclasses:
                self.get_class_hierarchy(subclass, class_hierarchy=class_hierarchy)
        return class_hierarchy

    def parse_fst(self):
        self.extract_compositions()
        self.extract_mechanisms()
        self.extract_projections()
        self.construct_working_fst()

    def construct_working_fst(self):
        composition_names = [c.fst_node.name.value for c in self.compositions]
        component_names = [c.fst_node.name.value for c in self.compositions + self.mechanisms + self.projections]
        outer_call_blacklist = [
            'print'
        ]
        composition_call_blacklist = [
            'run',
            'show_graph'
        ]
        fluid_fst = RedBaron(self.fst.dumps())
        blacklisted_calls = fluid_fst.find_all("name", lambda x: x if x.value in composition_call_blacklist and
                                                                      hasattr(
                                                                              x.previous.previous,
                                                                              'value'
                                                                      ) and
                                                                      x.previous.previous.value in \
                                                                      composition_names else False
                                               )
        for call in blacklisted_calls:
            if not call.parent == fluid_fst:
                call.parent.replace('pass')
            else:
                call.replace('pass')
        self.fluid_fst = fluid_fst
        assert True

    def extract_imports(self):
        self.imports = self.fst.find_all([
            "fromimport",
            "import"
        ])

    def extract_defs(self):
        # only extract top level defs. Ones nested within definitions of other Classes or Functions will be picked up
        # in the outer def's instantiation
        self.defs = self.fst.find_all('def',
                                      recursive=False)
        for _def in self.defs:
            self.add_assignment(_def.name, _def)
        assert True

    @property
    def compositions(self):
        return list(self._compositions)

    def add_composition(self, composition):
        self._compositions.add(composition)

    @property
    def composition_manipulations(self):
        return list(self._composition_manipulations)

    def add_composition_manipulation(self, composition_manipulation):
        self._composition_manipulations.add(composition_manipulation)

    @property
    def mechanisms(self):
        return list(self._mechanisms)

    def add_mechanism(self, mechanism):
        self._mechanisms.add(mechanism)

    def update_mechanisms(self, mechanisms):
        self._mechanisms.update(mechanisms)

    @property
    def projections(self):
        return list(self._projections)

    def add_projection(self, projection):
        self._projections.add(projection)

    @property
    def mechanism_dependencies(self):
        return list(self._mechanism_dependencies)

    def add_mechanism_dependency(self, mechanism_dependency):
        self._mechanism_dependencies.add(mechanism_dependency)

    @property
    def assignments(self, assignment):
        return self._assignments[assignment]

    def add_assignment(self, assignment, node):
        self._assignments[assignment] = node

    @property
    def peripheral_dependencies(self):
        return list(self._peripheral_dependencies)

    def add_peripheral_dependency(self, peripheral_dependency):
        self._peripheral_dependencies.add(peripheral_dependency)

    def add_dependency_node(self,
                            fst_node,
                            dependency_type,
                            dependents=None,
                            dependencies=None):
        if fst_node.type == 'assignment':
            self.add_assignment(fst_node.name.value, fst_node)
        if not fst_node in self.index:
            dn = _DependencyNode(fst_node, dependency_type)
            self.index[fst_node] = {
                'node': dn,
                'instantiated': False
            }
            self._dependency_method_map[dependency_type](dn)
        else:
            dn = self.index[fst_node]['node']
        if dependents:
            dn.add_dependents(dependents)
        if dependencies:
            dn.add_dependencies(dependencies)
        return dn

    def extract_compositions(self):
        script_compositions = self.fst.find_all("atomtrailers",
                                                lambda x: x if x.find_all('namenode',
                                                                          self.psyneulink_composition_classes)
                                                else False)
        for composition in script_compositions:
            if not composition.parent == self.fst:
                self.add_dependency_node(composition.parent, DependencyTypes.COMPOSITION)
            else:
                self.add_dependency_node(composition, DependencyTypes.COMPOSITION)

    def extract_mechanisms(self):
        script_mechanisms = self.fst.find_all("atomtrailers",
                                              lambda x: x if x.find_all('namenode',
                                                                        self.psyneulink_mechanism_classes)
                                              else False)
        for mechanism in script_mechanisms:
            if not mechanism.parent == self.fst:
                self.add_dependency_node(mechanism.parent, DependencyTypes.MECHANISM)
            else:
                self.add_dependency_node(mechanism, DependencyTypes.MECHANISM)

    def extract_projections(self):
        script_projections = self.fst.find_all("atomtrailers",
                                               lambda x: x if x.find_all('namenode',
                                                                         self.psyneulink_projection_classes)
                                               else False)
        for projection in script_projections:
            if not projection.parent == self.fst:
                self.add_dependency_node(projection.parent, DependencyTypes.PROJECTION)
            else:
                self.add_dependency_node(projection, DependencyTypes.PROJECTION)

    def execute_ast(self, namespace):
        blacklist = [
            'run',
            'execute',
            'show_graph',
            'plot',
            'set_xlabel',
            'set_ylabel',
            'set_title',
            'subplots'
        ]
        for i in self.fst:
            if not i.find('name', blacklist, recursive=True) and not \
                    i.find('assert', recursive=True):
                self.src_executed += i.dumps() + '\n'
                exec(i.dumps(), namespace)
            else:
                assert True