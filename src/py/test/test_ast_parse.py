import pytest
import ast_parse
import psyneulink


class TestSuite:
    def test_single_composition(self):
        src_str = 'import psyneulink\n\n' \
                  'c = psyneulink.Composition()'
        dg = ast_parse.DependencyGraph(src_str, psyneulink)
        assert len(dg.compositions) == 1
        assert dg.compositions[0].fst_node.dumps() == 'c = psyneulink.Composition()'

    def test_single_mechanism(self):
        src_str = 'import psyneulink\n\n' \
                  'c = psyneulink.Composition()\n' \
                  'm = psyneulink.TransferMechanism()\n' \
                  'c.add_node(m)'
        dg = ast_parse.DependencyGraph(src_str, psyneulink)
        assert len(dg.mechanisms) == 1
        assert dg.mechanisms[0].fst_node.dumps() == 'm = psyneulink.TransferMechanism()'

    def test_single_projection(self):
        src_str = 'import psyneulink\n\n' \
                  'c = psyneulink.Composition()\n' \
                  'm1 = psyneulink.TransferMechanism()\n' \
                  'm2 = psyneulink.TransferMechanism()\n' \
                  'p = psyneulink.MappingProjection(\n' \
                  '        sender=m1,\n' \
                  '        receiver=m2\n' \
                  ')\n' \
                  'c.add_node(m1)\n' \
                  'c.add_node(m2)\n' \
                  'c.add_projection(p)'
        dg = ast_parse.DependencyGraph(src_str, psyneulink)
        assert len(dg.projections) == 1
        assert dg.projections[0].fst_node.dumps() == 'p = psyneulink.MappingProjection(\n' \
                                                     '        sender=m1,\n' \
                                                     '        receiver=m2\n)'

    @pytest.mark.parametrize("filepath", [
        './pnl_scripts/Adaptive Replay Model.py',
        './pnl_scripts/Botvinick Model Composition.py',
        './pnl_scripts/ColorMotionTask_SIMPLE.py',
        './pnl_scripts/EVC-Gratton Composition.py',
        './pnl_scripts/GreedyAgentModel_LLVM_TEST.py',
        './pnl_scripts/LC Control Mechanism Composition.py',
        './pnl_scripts/NeuroML Example.py',
        './pnl_scripts/Rumelhart Semantic Network.py',
        './pnl_scripts/StabilityFlexibility.py',
        './pnl_scripts/bi-percepts.py'
    ])
    def test_actual_scripts(self, filepath):
        src_str = open(filepath, 'r').read()
        dg = ast_parse.DependencyGraph(src_str, psyneulink)
        namespace = {}
        dg.execute_ast(namespace)
        psyneulink.clear_registry(psyneulink.MechanismRegistry)
        psyneulink.clear_registry(psyneulink.CompositionRegistry)
        psyneulink.clear_registry(psyneulink.FunctionRegistry)
        fresh_namespace = {}
        exec(dg.src_executed, fresh_namespace)
        for cat in psyneulink.CompositionRegistry:
            for comp_name in psyneulink.CompositionRegistry[cat][1]:
                psyneulink.CompositionRegistry[cat][1][comp_name].show_graph()
