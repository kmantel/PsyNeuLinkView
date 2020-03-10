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
        "Width": 79.12,
        "Height": 69.04,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 117
    },
    "Graph Settings": {
        "Scale": 0.45,
        "Components": {
            "Nodes": {
                "REP_IN": {
                    "x": -5.2,
                    "y": 24.52
                },
                "MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                    "x": -3.79,
                    "y": 29.44
                },
                "Learning Mechanism for MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                    "x": -7.47,
                    "y": 73.46
                },
                "Target-3": {
                    "x": 79.56,
                    "y": 53.78
                },
                "Comparator-3": {
                    "x": 79.67,
                    "y": 58.68
                },
                "Target-2": {
                    "x": 65.88,
                    "y": 53.78
                },
                "Comparator-2": {
                    "x": 63.71,
                    "y": 58.68
                },
                "Target-1": {
                    "x": 19.46,
                    "y": 53.78
                },
                "Comparator-1": {
                    "x": 17.22,
                    "y": 58.68
                },
                "Target": {
                    "x": 40.34,
                    "y": 53.78
                },
                "Comparator": {
                    "x": 40.45,
                    "y": 58.68
                },
                "REL_IN": {
                    "x": 99.31,
                    "y": 63.59
                },
                "MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 64.26,
                    "y": 73.48
                },
                "Learning Mechanism for MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 62.59,
                    "y": 68.48
                },
                "REL_HIDDEN": {
                    "x": 43.81,
                    "y": 44.05
                },
                "Learning Mechanism for MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 8.6,
                    "y": 68.48
                },
                "MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                    "x": 34.19,
                    "y": 49.04
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                    "x": 35,
                    "y": 63.65
                },
                "MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                    "x": 12,
                    "y": 49.04
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                    "x": 8.99,
                    "y": 63.65
                },
                "MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                    "x": 58.39,
                    "y": 49.04
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                    "x": 55.48,
                    "y": 63.65
                },
                "MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                    "x": 80.51,
                    "y": 49.04
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                    "x": 76.25,
                    "y": 63.65
                },
                "MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 7.56,
                    "y": 39.24
                },
                "REP_HIDDEN": {
                    "x": 0.01,
                    "y": 34.24
                },
                "REP_OUT": {
                    "x": 42.95,
                    "y": 53.78
                },
                "PROP_OUT": {
                    "x": 16.13,
                    "y": 53.78
                },
                "QUAL_OUT": {
                    "x": 62.54,
                    "y": 53.78
                },
                "ACT_OUT": {
                    "x": 82.49,
                    "y": 53.78
                }
            }
        }
    }
}
