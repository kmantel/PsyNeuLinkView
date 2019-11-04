from redbaron import RedBaron
from enum import Enum

fp = '/Users/ds70/Library/Preferences/PyCharm2019.2/scratches/scratch_AST_PARSE_EX_SCRIPT.py'

class DependencyTypes(Enum):
    COMPOSITION = 0
    COMPOSITION_MANIPULATION = 1
    MECHANISM = 2
    MECHANISM_DEPENDENCY = 3
    RECURSIVE_DEPENDENCY = 4

class _DependencyNode:
    def __init__(self, fst_node):
        self.dependencies = []
        self.fst_node = fst_node

class DependencyGraph:
    def __init__(self, fp):
        self.imports = []
        self.path_operations = []
        self._compositions = set()
        self._composition_manipulations = set()
        self._mechanisms = set()
        self._mechanism_dependencies = set()
        self._recursive_dependencies = set()
        self._dependency_method_map = {
            DependencyTypes.COMPOSITION: self.add_composition,
            DependencyTypes.COMPOSITION_MANIPULATION: self.add_composition_manipulation,
            DependencyTypes.MECHANISM: self.add_mechanism,
            DependencyTypes.MECHANISM_DEPENDENCY: self.add_mechanism_dependency,
            DependencyTypes.RECURSIVE_DEPENDENCY: self.add_recursive_dependency
        }
        self.index = {}
        self.fst = ''
        self.graph_dict = ''
        self.filepath = fp
        self.fst = RedBaron(open(self.filepath,'r').read())
        self.parse_fst()

    def parse_fst(self):
        self.extract_imports()
        self.extract_path_operations()
        self.extract_compositions()
        self.extract_composition_manipulations()
        self.extract_mechanisms()
        self.extract_mechanism_dependencies()
        self.extract_dependency_dependencies()

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

    @property
    def mechanism_dependencies(self):
        return list(self._mechanism_dependencies)

    def add_mechanism_dependency(self, mechanism_dependency):
        self._mechanism_dependencies.add(mechanism_dependency)

    @property
    def recursive_dependencies(self):
        return list(self._recursive_dependencies)

    def add_recursive_dependency(self, recursive_dependency):
        self._recursive_dependencies.add(recursive_dependency)

    def add_dependency_node(self, fst_node, dependency_type):
        if not fst_node in self.index:
            dn = _DependencyNode(fst_node)
            self.index[fst_node] = {
                'dependency_node':dn,
                'instantiated':False
            }
            self._dependency_method_map[dependency_type](dn)
        else:
            dn = self.index[fst_node]
        return dn

    def extract_path_operations(self):
        pass

    def extract_compositions(self):
        script_compositions = self.fst.find_all("assign",
                                              lambda x: x if x.find_all("atomtrailers",
                                                                        lambda x: x if x.find_all('namenode',
                                                                                                  'Composition')
                                                                        else False)
                                              else False)
        for composition in script_compositions:
            self.add_composition(self.add_dependency_node(composition, DependencyTypes.COMPOSITION))

    def extract_composition_manipulations(self):
        mechanism_methods = [
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
        for composition_node in self.compositions:
            composition_name = composition_node.fst_node.find('name').value
            composition_calls = self.fst.find_all(
                    'atomtrailers',
                    lambda x: x if x.find('name', composition_name)
                    else False
            )
            for call in composition_calls:
                call_begin_node = call.find('name', composition_name)
                if call_begin_node.next.type == 'dot' and \
                    call_begin_node.next.next.value in mechanism_methods:
                        self.add_dependency_node(call, DependencyTypes.COMPOSITION_MANIPULATION)


    def extract_mechanisms(self):
        for composition_manipulation in self.composition_manipulations:
            call = composition_manipulation.fst_node.find('call')

    def extract_mechanism_dependencies(self):
        pass

    def extract_dependency_dependencies(self):
        pass

dg = DependencyGraph(fp)