from psyneulink import *
import numpy as np
import typecheck as tc

# This script implements the following network, first described in Rumelhart and Todd
# (Rumelhart, D. E., & Todd, P. M. (1993). Learning and connectionist representations. Attention and performance XIV:
#  Synergies in experimental psychology, artificial intelligence, and cognitive neuroscience, 3-30).

# Semantic Network:

#  Represention  Property  Quality  Action
#           \________\_______/_______/
#                        |
#                 Relations_Hidden
#                   _____|_____
#                  /           \
#   Representation_Hidden  Relations_Input
#               /
#   Representation_Input

# Construct Mechanisms
rep_in = TransferMechanism(size=10, name='REP_IN')
rel_in = TransferMechanism(size=11, name='REL_IN')
rep_hidden = TransferMechanism(size=4, function=Logistic, name='REP_HIDDEN')
rel_hidden = TransferMechanism(size=5, function=Logistic, name='REL_HIDDEN')
rep_out = TransferMechanism(size=10, function=Logistic, name='REP_OUT')
prop_out = TransferMechanism(size=12, function=Logistic, name='PROP_OUT')
qual_out = TransferMechanism(size=13, function=Logistic, name='QUAL_OUT')
act_out = TransferMechanism(size=14, function=Logistic, name='ACT_OUT')

# Construct Composition
comp = Composition(name='Rumelhart Semantic Network')
comp.add_backpropagation_learning_pathway(pathway=[rel_in, rel_hidden])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, rep_out])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, prop_out])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, qual_out])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, act_out])
comp.add_backpropagation_learning_pathway(pathway=[rep_in, rep_hidden, rel_hidden])
gv = comp.show_graph(
        # output_fmt='gv',
        show_learning=True,
        show_controller=True)
pnlv_graphics_spec = {
    "components": {
        "nodes": {
            "REP_IN": {
                "cx": 332.3304042442172,
                "cy": 935.0979877546722
            },
            "MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                "cx": 507.68334003523285,
                "cy": 1016.901881797641
            },
            "REP_HIDDEN": {
                "cx": 507.68334003523285,
                "cy": 1088.901881797641
            },
            "MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 911.6833400352328,
                "cy": 1160.901881797641
            },
            "MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                "cx": 1053.683340035233,
                "cy": 1304.901881797641
            },
            "Target-1": {
                "cx": 1160.6833400352327,
                "cy": 1376.901881797641
            },
            "Target": {
                "cx": 1876.6833400352327,
                "cy": 1376.901881797641
            },
            "MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                "cx": 1816.6833400352327,
                "cy": 1304.901881797641
            },
            "PROP_OUT": {
                "cx": 1053.683340035233,
                "cy": 1376.901881797641
            },
            "REL_HIDDEN": {
                "cx": 2014.6833400352327,
                "cy": 1232.901881797641
            },
            "REP_OUT": {
                "cx": 1971.6833400352327,
                "cy": 1376.901881797641
            },
            "Comparator-1": {
                "cx": 1096.683340035233,
                "cy": 1448.901881797641
            },
            "Comparator": {
                "cx": 1894.6833400352327,
                "cy": 1448.901881797641
            },
            "MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                "cx": 2653.683340035233,
                "cy": 1304.901881797641
            },
            "QUAL_OUT": {
                "cx": 2653.683340035233,
                "cy": 1376.901881797641
            },
            "Target-2": {
                "cx": 2759.683340035233,
                "cy": 1376.901881797641
            },
            "Comparator-2": {
                "cx": 2697.683340035233,
                "cy": 1448.901881797641
            },
            "Target-3": {
                "cx": 3240.683340035233,
                "cy": 1376.901881797641
            },
            "Comparator-3": {
                "cx": 3256.683340035233,
                "cy": 1448.901881797641
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                "cx": 1896.6833400352327,
                "cy": 1520.901881797641
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                "cx": 1006.6833400352328,
                "cy": 1520.901881797641
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                "cx": 2608.683340035233,
                "cy": 1520.901881797641
            },
            "MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                "cx": 3414.683340035233,
                "cy": 1304.901881797641
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                "cx": 3329.683340035233,
                "cy": 1520.901881797641
            },
            "ACT_OUT": {
                "cx": 3341.683340035233,
                "cy": 1376.901881797641
            },
            "Learning Mechanism for MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 2842.683340035233,
                "cy": 1592.901881797641
            },
            "Learning Mechanism for MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 998.6833400352328,
                "cy": 1592.901881797641
            },
            "Learning Mechanism for MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                "cx": 439.68334003523285,
                "cy": 1664.901881797641
            },
            "MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 2842.683340035233,
                "cy": 1664.901881797641
            },
            "REL_IN": {
                "cx": 3911.683340035233,
                "cy": 1520.901881797641
            }
        }
    }
}
