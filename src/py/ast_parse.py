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
        self.extract_imports()
        self.extract_defs()
        self.extract_path_operations()
        self.extract_compositions()
        self.extract_composition_manipulations()
        self.extract_mechanisms()
        self.extract_projections()
        self.extract_peripheral_dependencies()

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

    def extract_path_operations(self):
        pass

    def extract_compositions(self):
        script_compositions = self.fst.find_all("assign",
                                                lambda x: x if x.find_all("atomtrailers",
                                                                          lambda x: x if x.find_all('namenode',
                                                                                                    self.psyneulink_composition_classes)
                                                                          else False)
                                                else False)
        for composition in script_compositions:
            self.add_dependency_node(composition, DependencyTypes.COMPOSITION)

    def extract_composition_manipulations(self):
        node_manipulation_methods = [
            'add_node',
            'add_nodes',
            'add_linear_processing_pathway',
            'add_linear_learning_pathway',
            'add_reinforcement_learning_pathway',
            'add_td_learning_pathway',
            'add_backpropagation_learning_pathway',
        ]
        projection_manipulation_methods = [
            'add_projection',
            'add_projections'
        ]
        manipulation_methods = node_manipulation_methods + projection_manipulation_methods
        for composition_node in self.compositions:
            composition_name = composition_node.fst_node.find('name').value
            node_manipulation_calls = [
                node for node in self.fst.find_all(
                        ['atomtrailers', 'assignment'],
                        lambda x: x if x.find('name', composition_name) and \
                            x.find('name', node_manipulation_methods)
                        else False,
                        recursive=False)
            ]
            projection_manipulation_calls = [
                node for node in self.fst.find_all(
                        ['atomtrailers', 'assignment'],
                        lambda x: x if x.find('name', composition_name) and \
                            x.find('name', projection_manipulation_methods)
                        else False,
                        recursive=False)
            ]
            node_manipulation_dependency_nodes = []
            for call in node_manipulation_calls:
                dn = self.add_dependency_node(
                        call,
                        DependencyTypes.COMPOSITION_MANIPULATION,
                        dependencies=composition_node
                )
                node_manipulation_dependency_nodes.append(dn)

            for call in projection_manipulation_calls:
                self.add_dependency_node(
                        call,
                        DependencyTypes.COMPOSITION_MANIPULATION,
                        dependencies=[composition_node] + node_manipulation_dependency_nodes
                )

    def get_peripheral_dependencies(self, node):
        # node_unpacked = [i for i in self.unpack_node(node) if not i in self.assignments and not i in ns]
        node_unpacked = [i for i in self.unpack_node(node)]
        if node_unpacked:
            for i in node_unpacked:
                if i in self._assignments:
                    assignment = self._assignments[i]
                elif i in self.all_assigns_dict:
                    assignment = self.all_assigns_dict[i]
                else:
                    assignment = None
                if assignment:
                    self.add_dependency_node(
                            assignment,
                            DependencyTypes.PERIPHERAL_DEPENDENCY,
                            dependents=self.index[node]['node']
                    )
                    self.get_peripheral_dependencies(assignment)
        pass

    def handle_atom_trailers(self, node, tokens):
        tokens.append(node.name.value)
        for j in [i for i in node.value if i.type == 'getitem' or i.type == 'call']:
            self.unpack_node(j, tokens)

    def unpack_node(self, node, tokens=None):
        # if AtomtrailersNode, check first name node and unpack GetitemNodes and CallNodes
        if tokens is None:
            tokens = []
        try:
            if node.type == 'atomtrailers':
                self.handle_atom_trailers(node, tokens)
            elif hasattr(node.value, 'type') \
                    and node.value.type == 'atomtrailers':
                self.handle_atom_trailers(node.value, tokens)
            else:
                for i in node.value:
                    if hasattr(i.value, 'type') \
                            and i.value.type == 'atomtrailers':
                        self.handle_atom_trailers(i.value, tokens)
                    elif isinstance(i.value, str):
                        tokens.append(i.value)
                        continue
                    else:
                        self.unpack_node(i, tokens)
        except (TypeError, AttributeError):
            if not node.value.type in ['int', 'float', 'binary',
                                       'string', 'raw_string', 'binary_string']:
                tokens.append(node.value.dumps())
        return tokens

    def extract_mechanisms(self):
        script_mechanisms = self.fst.find_all("assign",
                                              lambda x: x if x.find_all("atomtrailers",
                                                                        lambda x: x if x.find_all('namenode',
                                                                                                  self.psyneulink_mechanism_classes)
                                                                        else False)
                                              else False)
        for composition_manipulation in self.composition_manipulations:
            call = composition_manipulation.fst_node.find('call')
            call_args = self.unpack_node(call)
            for arg in call_args:
                mechanism_assignment_node = script_mechanisms.find(
                        "assign",
                        lambda x: x if x.find_all('namenode', arg)
                        else False
                )
                if mechanism_assignment_node:
                    self.add_dependency_node(
                            mechanism_assignment_node,
                            DependencyTypes.MECHANISM,
                            dependents=composition_manipulation
                    )

    def extract_projections(self):
        script_mechanisms = self.fst.find_all("assign",
                                              lambda x: x if x.find_all("atomtrailers",
                                                                        lambda x: x if x.find_all('namenode',
                                                                                                  self.psyneulink_projection_classes)
                                                                        else False)
                                              else False)
        for composition_manipulation in self.composition_manipulations:
            call = composition_manipulation.fst_node.find('call')
            call_args = self.unpack_node(call)
            for arg in call_args:
                projection_assignment_node = script_mechanisms.find(
                        "assign",
                        lambda x: x if x.find_all('namenode', arg)
                        else False
                )
                if projection_assignment_node:
                    self.add_dependency_node(
                            projection_assignment_node,
                            DependencyTypes.PROJECTION,
                            dependents=composition_manipulation
                    )

    def extract_mechanism_dependencies(self):
        pass

    def extract_peripheral_dependencies(self):
        primary_nodes = list(self.index.keys())
        for node in primary_nodes:
            self.get_peripheral_dependencies(node)

    def execute_imports(self, namespace):
        for imp in self.imports:
            self.src_executed += imp.dumps() + '\n'
            exec(imp.dumps(), namespace)

    def traverse_graph(self,
                       node,
                       namespace,
                       referring_composition,
                       enclosing_composition):
        if node.dependencies:
            for i in node.dependencies:
                if i == referring_composition or \
                        not i.node_type == DependencyTypes.COMPOSITION:
                    self.traverse_graph(i, namespace, referring_composition, enclosing_composition)
                else:
                    self.traverse_graph_from_composition(i,
                                                         namespace,
                                                         enclosing_composition = referring_composition)
        if not self.index[node.fst_node]['instantiated']:
            self.src_executed += node.fst_node.dumps() + '\n'
            exec(node.fst_node.dumps(), namespace)
            self.index[node.fst_node]['instantiated'] = True

    def traverse_graph_from_composition(self,
                                        composition_node,
                                        namespace,
                                        enclosing_composition = None):
        if not enclosing_composition:
            composition_manipulation_blacklist = []
        else:
            composition_manipulation_blacklist = [i for i in enclosing_composition.dependents if i.node_type ==
                                                  DependencyTypes.COMPOSITION_MANIPULATION]
        for composition_manipulation in [i for i in composition_node.dependents if
                                         i.node_type == DependencyTypes.COMPOSITION_MANIPULATION and not
                                         i in composition_manipulation_blacklist]:
            self.traverse_graph(
                    composition_manipulation,
                    namespace,
                    composition_node,
                    enclosing_composition
            )
