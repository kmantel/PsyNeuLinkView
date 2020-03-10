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
        "Width": 90.95,
        "Height": 86.26,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 89
    },
    "Graph Settings": {
        "Scale": 0.53,
        "Components": {
            "Nodes": {
                "REP_IN": {
                    "x": 6.4,
                    "y": 21.88
                },
                "MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                    "x": 5.36,
                    "y": 27.98
                },
                "Learning Mechanism for MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                    "x": 2.04,
                    "y": 47.48
                },
                "Target-3": {
                    "x": 74.63,
                    "y": 59.7
                },
                "Comparator-3": {
                    "x": 74.88,
                    "y": 62.84
                },
                "Target-2": {
                    "x": 56.78,
                    "y": 59.96
                },
                "Comparator-2": {
                    "x": 57.2,
                    "y": 63.61
                },
                "Target-1": {
                    "x": 21.44,
                    "y": 60.13
                },
                "Comparator-1": {
                    "x": 22.12,
                    "y": 63.7
                },
                "Target": {
                    "x": 39.37,
                    "y": 59.7
                },
                "Comparator": {
                    "x": 39.79,
                    "y": 63.18
                },
                "REL_IN": {
                    "x": 86.06,
                    "y": 39.61
                },
                "MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 67.26,
                    "y": 43.44
                },
                "Learning Mechanism for MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 82.09,
                    "y": 50.32
                },
                "REL_HIDDEN": {
                    "x": 52.35,
                    "y": 46.53
                },
                "Learning Mechanism for MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 1.66,
                    "y": 60.18
                },
                "MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                    "x": 38.63,
                    "y": 57.01
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                    "x": 39.33,
                    "y": 69.37
                },
                "MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                    "x": 20.9,
                    "y": 57.26
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                    "x": 21.6,
                    "y": 69.28
                },
                "MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                    "x": 58.23,
                    "y": 57.35
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                    "x": 56.86,
                    "y": 69.28
                },
                "MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                    "x": 76.07,
                    "y": 57.26
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                    "x": 74.72,
                    "y": 69.28
                },
                "MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 29.8,
                    "y": 44.04
                },
                "REP_HIDDEN": {
                    "x": 8.51,
                    "y": 38.64
                },
                "REP_OUT": {
                    "x": 42.87,
                    "y": 59.62
                },
                "PROP_OUT": {
                    "x": 25.01,
                    "y": 60.13
                },
                "QUAL_OUT": {
                    "x": 60.39,
                    "y": 59.96
                },
                "ACT_OUT": {
                    "x": 78.32,
                    "y": 59.7
                }
            }
        }
    }
}
