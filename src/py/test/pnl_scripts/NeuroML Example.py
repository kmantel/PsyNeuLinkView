import psyneulink as pnl

composition = pnl.Composition(name="composition")

fnPop1 = pnl.IntegratorMechanism(
    name="fnPop1",
    function=pnl.FitzHughNagumoIntegrator(
        a_v=0.7,
        a_w=0.7,
        b_v=0.8,
        b_w=0.8,
        initial_v=-1.2,
        initial_w=-0.6,
        time_step_size=0.001,
    ),
)
fnPop2 = pnl.IntegratorMechanism(
    name="fnPop2",
    function=pnl.FitzHughNagumoIntegrator(
        a_v=0.7,
        a_w=0.7,
        b_v=0.8,
        b_w=0.8,
        initial_v=-1.2,
        initial_w=-0.6,
        time_step_size=0.001,
    ),
)
syn1 = pnl.TransferMechanism(name="syn1", function=pnl.Exponential)

composition.add_node(fnPop1)
composition.add_node(fnPop2)
composition.add_node(syn1)

composition.add_projection(
    projection=pnl.MappingProjection(
        name="MappingProjection from syn1[OutputPort-0] to fnPop1[InputPort-0]",
        function=pnl.LinearMatrix(matrix=[[1.0]]),
        matrix=[[1.0]],
    ),
    sender=syn1,
    receiver=fnPop1,
)
composition.add_projection(
    projection=pnl.MappingProjection(
        name="MappingProjection from fnPop1[OutputPort-0] to fnPop2[InputPort-0]",
        function=pnl.LinearMatrix(matrix=[[1.0]]),
        matrix=[[1.0]],
    ),
    sender=fnPop1,
    receiver=fnPop2,
)
composition.show_graph()
pnlv_graphics_spec = {
    "components": {
        "nodes": {
            "syn1": {
                "cx": 159.68062481908743,
                "cy": 50.25548201692318
            },
            "fnPop1": {
                "cx": 65.86826214818899,
                "cy": 61.776443778397805
            },
            "fnPop2": {
                "cx": 281.437109804439,
                "cy": 108.22754317414973
            }
        }
    }
}
