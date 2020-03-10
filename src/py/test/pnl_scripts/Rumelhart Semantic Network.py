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

# PsyNeuLinkView Graphics Info 
pnlv_graphics_spec = {
    "Canvas Settings": {
        "Width": 91.37,
        "Height": 86.26,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 100
    },
    "Graph Settings": {
        "Scale": 0.53,
        "Components": {
            "Nodes": {
                "REP_IN": {
                    "x": 5.93,
                    "y": 25.16
                },
                "MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                    "x": 4.83,
                    "y": 31.46
                },
                "Learning Mechanism for MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                    "x": 1.57,
                    "y": 46.31
                },
                "Target-3": {
                    "x": 74.1,
                    "y": 58.76
                },
                "Comparator-3": {
                    "x": 74.36,
                    "y": 61.94
                },
                "Target-2": {
                    "x": 56.29,
                    "y": 58.98
                },
                "Comparator-2": {
                    "x": 56.7,
                    "y": 62.72
                },
                "Target-1": {
                    "x": 20.96,
                    "y": 59.22
                },
                "Comparator-1": {
                    "x": 21.61,
                    "y": 62.83
                },
                "Target": {
                    "x": 38.88,
                    "y": 58.76
                },
                "Comparator": {
                    "x": 39.29,
                    "y": 62.27
                },
                "REL_IN": {
                    "x": 85.53,
                    "y": 38.22
                },
                "MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 66.73,
                    "y": 42.18
                },
                "Learning Mechanism for MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 81.59,
                    "y": 49.21
                },
                "REL_HIDDEN": {
                    "x": 51.84,
                    "y": 45.31
                },
                "Learning Mechanism for MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 1.15,
                    "y": 59.26
                },
                "MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                    "x": 38.11,
                    "y": 56.03
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                    "x": 38.82,
                    "y": 68.64
                },
                "MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                    "x": 20.38,
                    "y": 56.25
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                    "x": 21.09,
                    "y": 68.53
                },
                "MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                    "x": 57.73,
                    "y": 56.36
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                    "x": 56.34,
                    "y": 68.53
                },
                "MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                    "x": 75.54,
                    "y": 56.25
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                    "x": 74.22,
                    "y": 68.53
                },
                "MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 29.3,
                    "y": 42.74
                },
                "REP_HIDDEN": {
                    "x": 8.03,
                    "y": 37.27
                },
                "REP_OUT": {
                    "x": 42.38,
                    "y": 58.65
                },
                "PROP_OUT": {
                    "x": 24.5,
                    "y": 59.22
                },
                "QUAL_OUT": {
                    "x": 59.9,
                    "y": 58.98
                },
                "ACT_OUT": {
                    "x": 77.82,
                    "y": 58.76
                }
            }
        }
    }
}
