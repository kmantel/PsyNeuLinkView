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
        "Width": 78.92,
        "Height": 69.04,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 67
    },
    "Graph Settings": {
        "Scale": 0.45,
        "Components": {
            "Nodes": {
                "REP_IN": {
                    "x": 86.7,
                    "y": 30.65
                },
                "MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                    "x": 76.91,
                    "y": 34.41
                },
                "Learning Mechanism for MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                    "x": 85.87,
                    "y": 67.7
                },
                "Target-3": {
                    "x": 55.63,
                    "y": 52.85
                },
                "Comparator-3": {
                    "x": 53.75,
                    "y": 56.6
                },
                "Target-2": {
                    "x": 77.88,
                    "y": 52.85
                },
                "Comparator-2": {
                    "x": 75.67,
                    "y": 56.6
                },
                "Target-1": {
                    "x": 10.76,
                    "y": 52.85
                },
                "Comparator-1": {
                    "x": 10.15,
                    "y": 56.6
                },
                "Target": {
                    "x": 34.47,
                    "y": 52.85
                },
                "Comparator": {
                    "x": 33.23,
                    "y": 56.6
                },
                "REL_IN": {
                    "x": 86.94,
                    "y": 60.25
                },
                "MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 67.04,
                    "y": 67.7
                },
                "Learning Mechanism for MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 65.38,
                    "y": 64.01
                },
                "REL_HIDDEN": {
                    "x": 40.86,
                    "y": 45.51
                },
                "Learning Mechanism for MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 14.7,
                    "y": 64.01
                },
                "MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                    "x": 25.39,
                    "y": 49.21
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                    "x": 25.24,
                    "y": 60.3
                },
                "MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                    "x": 0.84,
                    "y": 49.21
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                    "x": 4.53,
                    "y": 60.3
                },
                "MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                    "x": 70.34,
                    "y": 49.21
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                    "x": 66.95,
                    "y": 60.3
                },
                "MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                    "x": 48.4,
                    "y": 49.21
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                    "x": 45.7,
                    "y": 60.3
                },
                "MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 36.64,
                    "y": 41.81
                },
                "REP_HIDDEN": {
                    "x": 60.78,
                    "y": 38.11
                },
                "REP_OUT": {
                    "x": 31.44,
                    "y": 52.85
                },
                "PROP_OUT": {
                    "x": 7.41,
                    "y": 52.85
                },
                "QUAL_OUT": {
                    "x": 74.52,
                    "y": 52.85
                },
                "ACT_OUT": {
                    "x": 52.54,
                    "y": 52.85
                }
            }
        }
    }
}
