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
                "cx": 1039.683324776444,
                "cy": 864.9019428327972
            },
            "REP_IN": {
                "cx": 816.6440944297641,
                "cy": 21.372523887484647
            },
            "MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                "cx": 1009.6440944297641,
                "cy": 93.3725238874847
            },
            "REP_HIDDEN": {
                "cx": 1009.6440944297641,
                "cy": 165.3725238874847
            },
            "MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 1413.6440944297642,
                "cy": 237.3725238874847
            },
            "Learning Mechanism for MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                "cx": 1500.6440944297642,
                "cy": 669.3725238874847
            },
            "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                "cx": 1508.6440944297642,
                "cy": 597.3725238874847
            },
            "MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                "cx": 1555.6440944297642,
                "cy": 381.3725238874847
            },
            "Comparator-1": {
                "cx": 1598.6440944297642,
                "cy": 525.3725238874847
            },
            "PROP_OUT": {
                "cx": 1555.6440944297642,
                "cy": 453.3725238874847
            }
        }
    }
}
