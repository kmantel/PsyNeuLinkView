from redbaron import RedBaron
from enum import Enum

fp = '/Users/ds70/Library/Preferences/PyCharm2019.2/scratches/scratch_AST_PARSE_EX_SCRIPT.py'
fp = '/Users/ds70/PycharmProjects/PsyNeuLink/Scripts/Examples/Composition/Botvinick Model Composition.py'
fp = '/Users/ds70/PycharmProjects/PsyNeuLink/Scripts/Examples/Composition/EVC OCM.py'

class DependencyTypes(Enum):
    COMPOSITION_MANIPULATION = 0
    COMPOSITION = 1
    MECHANISM = 2
    MECHANISM_DEPENDENCY = 3
    PERIPHERAL_DEPENDENCY = 4


class _DependencyNode:
    def __init__(self, fst_node):
        self.dependencies = []
        self.fst_node = fst_node

    def add_dependency(self, dependency):
        if not dependency in self.dependencies:
            self.dependencies.append(dependency)


class DependencyGraph:
    def __init__(self, fp, psyneulink_instance):
        self.psyneulink_instance = psyneulink_instance
        self.psyneulink_composition_classes = self.get_class_hierarchy(self.psyneulink_instance.Composition)
        self.psyneulink_mechanism_classes = self.get_class_hierarchy(self.psyneulink_instance.Mechanism)
        self.psyneulink_function_classes = self.get_class_hierarchy(self.psyneulink_instance.Function)
        self.imports = []
        self.path_operations = []
        self._compositions = set()
        self._composition_manipulations = set()
        self._mechanisms = set()
        self._mechanism_dependencies = set()
        self._peripheral_dependencies = set()
        self._dependency_method_map = {
            DependencyTypes.COMPOSITION: self.add_composition,
            DependencyTypes.COMPOSITION_MANIPULATION: self.add_composition_manipulation,
            DependencyTypes.MECHANISM: self.add_mechanism,
            DependencyTypes.MECHANISM_DEPENDENCY: self.add_mechanism_dependency,
            DependencyTypes.PERIPHERAL_DEPENDENCY: self.add_peripheral_dependency
        }
        self.manipulation_methods = [
            'add_node',
            'add_nodes',
            'add_projection',
            'add_projections',
            'add_linear_processing_pathway',
            'add_linear_learning_pathway',
            'add_reinforcement_learning_pathway',
            'add_td_learning_pathway',
            'add_backpropagation_learning_pathway',
        ]
        self.index = {}
        self.fst = ''
        self.graph_dict = ''
        self.filepath = fp
        self.fst = RedBaron(open(self.filepath, 'r').read())
        self.parse_fst()

    def get_class_hierarchy(self, root_class, class_hierarchy = None):
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
        self.extract_path_operations()
        self.extract_compositions()
        self.extract_composition_manipulations()
        self.extract_mechanisms()
        self.extract_mechanism_dependencies()
        self.extract_peripheral_dependencies()

    def extract_imports(self):
        self.imports = self.fst.find_all([
            "fromimport",
            "import"
        ])

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
    def mechanism_dependencies(self):
        return list(self._mechanism_dependencies)

    def add_mechanism_dependency(self, mechanism_dependency):
        self._mechanism_dependencies.add(mechanism_dependency)

    @property
    def peripheral_dependencies(self):
        return list(self._peripheral_dependencies)

    def add_peripheral_dependency(self, peripheral_dependency):
        self._peripheral_dependencies.add(peripheral_dependency)

    def add_dependency_node(self,
                            fst_node,
                            dependency_type,
                            dependee=None,
                            dependent=None):
        if not fst_node in self.index:
            dn = _DependencyNode(fst_node)
            self.index[fst_node] = {
                'node': dn,
                'instantiated': False
            }
            self._dependency_method_map[dependency_type](dn)
        else:
            dn = self.index[fst_node]['node']
        if dependee:
            dependee.add_dependency(dn)
        if dependent:
            dn.add_dependency(dependent)
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
        for composition_node in self.compositions:
            composition_name = composition_node.fst_node.find('name').value
            composition_calls = [node for node in self.fst.find_all(
                    'atomtrailers',
                    lambda x: x if x.find('name', composition_name) and \
                        x.find('name', composition_name).next and x.find('name', composition_name).next.type == 'dot' and \
                        x.find('name', composition_name).next.next and x.find('name', composition_name).next.next.value in self.manipulation_methods
                        else False
            )]
            for call in composition_calls:
                self.add_dependency_node(
                        call,
                        DependencyTypes.COMPOSITION_MANIPULATION,
                        dependent=composition_node
                )

    def unpack_call_node(self, call_node, tokens = None):
        if not tokens:
            tokens = []
        try:
            for i in call_node.value:
                tokens = self.unpack_call_node(i, tokens)
        except (TypeError, AttributeError):
            tokens.append(call_node.value.value)
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
            test = self.unpack_call_node(call)
            call_args = call.find_all('call_argument')
            try:
                call_args_iterable = [arg for arg in call_args]
            except TypeError:
                call_args_iterable = [call_args]
            for arg in call_args_iterable:
                if arg.value.type == 'list':
                    arg_iterable = [i.value for i in arg.value]
                else:
                    arg_iterable = [arg.value]
                for i in arg_iterable:
                    mechanism_assignment_node = script_mechanisms.find(
                            "assign",
                            lambda x: x if x.find_all('namenode', i.value)
                            else False
                    )
                    if mechanism_assignment_node:
                        self.add_dependency_node(
                                mechanism_assignment_node,
                                DependencyTypes.MECHANISM,
                                dependee=composition_manipulation
                        )

    def extract_mechanism_dependencies(self):
        pass

    def extract_peripheral_dependencies(self):
        pass

import psyneulink

dg = DependencyGraph(fp, psyneulink)
