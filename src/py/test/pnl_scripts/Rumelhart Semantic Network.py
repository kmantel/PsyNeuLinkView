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
                "cx": 185.67,
                "cy": 548.77
            },
            "MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                "cx": 378.67,
                "cy": 620.77
            },
            "Learning Mechanism for MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                "cx": 2918.64,
                "cy": 828.39
            },
            "Target-3": {
                "cx": 2750.9,
                "cy": 1104.08
            },
            "Comparator-3": {
                "cx": 1978.89,
                "cy": 1028.06
            },
            "Target-2": {
                "cx": 2269.9,
                "cy": 1104.08
            },
            "Comparator-2": {
                "cx": 2207.9,
                "cy": 1176.08
            },
            "Target-1": {
                "cx": 1031.67,
                "cy": 980.77
            },
            "Comparator-1": {
                "cx": 967.67,
                "cy": 1052.77
            },
            "Target": {
                "cx": 1747.67,
                "cy": 980.77
            },
            "Comparator": {
                "cx": 1217.88,
                "cy": 1029.82
            },
            "REL_IN": {
                "cx": 3421.9,
                "cy": 1248.08
            },
            "MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 2206.54,
                "cy": 207.51
            },
            "Learning Mechanism for MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 1924.98,
                "cy": 225.91
            },
            "REL_HIDDEN": {
                "cx": 1885.67,
                "cy": 836.77
            },
            "Learning Mechanism for MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 845.07,
                "cy": 212.33
            },
            "MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                "cx": 972.31,
                "cy": 509.67
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                "cx": 930.4,
                "cy": 724.16
            },
            "MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                "cx": 302.37,
                "cy": 463.47
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                "cx": 274.44,
                "cy": 804.82
            },
            "MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                "cx": 2267.37,
                "cy": 490.69
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                "cx": 2142.32,
                "cy": 895.45
            },
            "MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                "cx": 1918.56,
                "cy": 571.56
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                "cx": 1385.77,
                "cy": 931.92
            },
            "MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 1576.89,
                "cy": 338.39
            },
            "REP_HIDDEN": {
                "cx": 378.67,
                "cy": 692.77
            },
            "REP_OUT": {
                "cx": 1842.67,
                "cy": 980.77
            },
            "PROP_OUT": {
                "cx": 924.67,
                "cy": 980.77
            },
            "QUAL_OUT": {
                "cx": 2163.9,
                "cy": 1104.08
            },
            "ACT_OUT": {
                "cx": 2851.9,
                "cy": 1104.08
            }
        }
    }
}
