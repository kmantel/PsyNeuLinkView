import graph_pb2
import graph_pb2_grpc
import grpc
from concurrent import futures
from redbaron import RedBaron
import json
import sys
if sys.argv[1]:
    try:
        print(sys.argv[1])
        sys.path.append(sys.argv[1])
    except:
        pass
sys.path.append('/Users/ds70/PycharmProjects/PsyNeuLink')
import psyneulink as pnl

class Container():
    def __init__(self):
        self.localvars = locals()
        self.pnl_objects = {
            'compositions': {},
            'components': {}
        }
        self.AST = None

    @property
    def hashable_pnl_objects(self):
        return {
            'compositions': [i for i in self.pnl_objects['compositions']],
            'components': [i for i in self.pnl_objects['components']]
        }


class GraphServer(graph_pb2_grpc.ServeGraphServicer):
    def LoadCustomPnl(self, request, context):
        filepath = request.path
        sys.path.append(filepath)
        return graph_pb2.NullArgument()

    def LoadScript(self, request, context):
        filepath = request.path
        load_script(filepath)
        print(pnl_container)
        return graph_pb2.ScriptCompositions(compositions=pnl_container.hashable_pnl_objects['compositions'])

    def GetCompositions(self, request, context):
        return graph_pb2.ScriptCompositions(compositions=pnl_container.hashable_pnl_objects['compositions'])

    def GetJSON(self, request, context):
        graph_name = request.name
        gv = get_gv_json(graph_name)
        return graph_pb2.GraphJSON(JSON=json.dumps(gv))


pnl_container = Container()


def get_new_pnl_objects(local_vars):
    local_vars_list = list(local_vars.values())
    prev_local_vars = pnl_container.localvars
    prev_local_vars_list = list(prev_local_vars.values())
    local_var_diff = [i for i in local_vars_list if not i in prev_local_vars_list]
    compositions = {i.name: i for i in local_var_diff if isinstance(i, pnl.Composition)}
    components = {i.name: i for i in local_var_diff if isinstance(i, pnl.Component)}
    pnl_container.pnl_objects['compositions'].update(compositions)
    pnl_container.pnl_objects['components'].update(components)
    return compositions, components


def load_script(filepath):
    rb = RedBaron(open(filepath, 'r').read())
    rb_str = rb.dumps()
    print(rb_str)
    pnl_container.AST = rb_str
    namespace = {}
    exec(compile(rb_str, filename="<ast>", mode="exec"), namespace)
    compositions, components = get_new_pnl_objects(namespace)
    return pnl_container.hashable_pnl_objects['compositions']


def get_gv_json(name):
    comp = name
    pnl_container.pnl_objects['compositions'][comp]._analyze_graph()
    gv = pnl_container.pnl_objects['compositions'][comp].show_graph(output_fmt='gv',
                                                                    show_learning=True,
                                                                    )
    gv_dict = json.loads(gv.pipe(format='json').decode('utf-8'))
    gv_dict_reduced = {
        'objects': gv_dict['objects'],
        'edges': gv_dict['edges']
    }
    max_x = 0
    max_y = 0
    for object in gv_dict_reduced['objects']:
        x, y = object['pos'].split(',')
        x = float(x)
        y = float(y)
        if x > max_x:
            max_x = x
        if y > max_y:
            max_y = y
    gv_dict_reduced['max_x'] = max_x * 0.25 + max_x
    gv_dict_reduced['max_y'] = max_y * 0.25 + max_y
    return gv_dict_reduced


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    graph_pb2_grpc.add_ServeGraphServicer_to_server(GraphServer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()
    server.stop()

if __name__ == '__main__':
    serve()