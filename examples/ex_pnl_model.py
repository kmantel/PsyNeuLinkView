import math
import psyneulink as pnl

t1 = pnl.TransferMechanism()
t2 = pnl.TransferMechanism()
t3 = pnl.TransferMechanism()

c = pnl.Composition()
c.add_linear_processing_pathway([
    t1,
    t2,
    t3
])
