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
            "Learning Mechanism for MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                "cx": 1445.5655963374127,
                "cy": 1254.7711747113399
            },
            "REP_IN": {
                "cx": 1222.526365990733,
                "cy": 411.24175576602704
            },
            "MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                "cx": 1415.526365990733,
                "cy": 483.2417557660272
            },
            "REP_HIDDEN": {
                "cx": 1415.526365990733,
                "cy": 555.2417557660274
            },
            "MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 1819.526365990733,
                "cy": 627.2417557660274
            },
            "Learning Mechanism for MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 1906.526365990733,
                "cy": 1059.2417557660274
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                "cx": 1914.526365990733,
                "cy": 987.2417557660274
            },
            "MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                "cx": 1961.526365990732,
                "cy": 771.2417557660274
            },
            "Comparator-1": {
                "cx": 2004.5263659907312,
                "cy": 915.2417557660274
            },
            "PROP_OUT": {
                "cx": 1961.526365990732,
                "cy": 843.2417557660274
            },
            "MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 3015.792269571672,
                "cy": 1565.6099443622666
            },
            "Learning Mechanism for MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 3015.792269571672,
                "cy": 1493.6099443622666
            },
            "REL_IN": {
                "cx": 3565.792269571672,
                "cy": 1421.6099443622666
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                "cx": 3090.792269571672,
                "cy": 1421.6099443622666
            },
            "Comparator-2": {
                "cx": 3194.792269571672,
                "cy": 1349.6099443622666
            },
            "Target-3": {
                "cx": 2490.792269571672,
                "cy": 1277.6099443622666
            },
            "Target-2": {
                "cx": 3256.792269571672,
                "cy": 1277.6099443622666
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                "cx": 2354.792269571672,
                "cy": 1421.6099443622666
            },
            "QUAL_OUT": {
                "cx": 3150.792269571672,
                "cy": 1277.6099443622666
            },
            "Comparator-3": {
                "cx": 2439.792269571672,
                "cy": 1349.6099443622666
            },
            "MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                "cx": 3150.792269571672,
                "cy": 1205.6099443622666
            },
            "MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                "cx": 2389.792269571672,
                "cy": 1205.6099443622666
            },
            "ACT_OUT": {
                "cx": 2389.792269571672,
                "cy": 1277.6099443622666
            },
            "REL_HIDDEN": {
                "cx": 1994.792269571673,
                "cy": 1133.6099443622666
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                "cx": 1648.7922695716748,
                "cy": 1421.6099443622666
            },
            "Target": {
                "cx": 1754.7922695716748,
                "cy": 1277.6099443622666
            },
            "Comparator": {
                "cx": 1726.7922695716748,
                "cy": 1349.6099443622666
            },
            "MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                "cx": 1598.7922695716748,
                "cy": 1205.6099443622666
            },
            "REP_OUT": {
                "cx": 1659.7922695716748,
                "cy": 1277.6099443622666
            },
            "Target-1": {
                "cx": 957.7922695716748,
                "cy": 1277.6099443622666
            }
        }
    }
}
