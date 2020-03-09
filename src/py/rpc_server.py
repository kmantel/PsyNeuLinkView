import graph_pb2
import graph_pb2_grpc
import grpc
from concurrent import futures
import redbaron
import json
import sys
import subprocess, os
from xml.etree.cElementTree import fromstring
from collections import defaultdict
import ast_parse
import random
import warnings

my_env = os.environ

sys.path.append(os.getenv('PATH'))

if len(sys.argv) > 1:
    try:
        sys.path.append(sys.argv[1])
    except:
        pass

import psyneulink as pnl

class Container():
    def __init__(self):
        self.localvars = locals()
        self.pnl_objects = {
            'compositions': {},
            'components': {}
        }
        self.graphics_spec = {

        }
        self.filepath = None
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

    def LoadGraphics(self, request, context):
        filepath = request.path
        load_style(filepath)
        graphics = pnl_container.graphics_spec
        return graph_pb2.StyleJSON(styleJSON=json.dumps(graphics))

    def LoadScript(self, request, context):
        filepath = request.path
        load_script(filepath)
        return graph_pb2.ScriptCompositions(compositions=pnl_container.hashable_pnl_objects['compositions'])

    def GetCompositions(self, request, context):
        return graph_pb2.ScriptCompositions(compositions=pnl_container.hashable_pnl_objects['compositions'])

    def GetJSON(self, request, context):
        graph_name = request.name
        gv = get_gv_json(graph_name)
        graphics = pnl_container.graphics_spec
        return graph_pb2.GraphJSON(objectsJSON=json.dumps(gv),
                                   styleJSON=json.dumps(graphics))

    def UpdateStylesheet(self, request_iterator, context):
        for request in request_iterator:
            update_graphics_dict(json.loads(request.styleJSON))
        return graph_pb2.NullArgument()

    def HealthCheck(self, request, context):
        return graph_pb2.HealthStatus(status='Okay')

pnl_container = Container()

def get_new_pnl_objects(namespace):
    compositions = {}
    for cat in pnl.CompositionRegistry:
        for comp_name in pnl.CompositionRegistry[cat][1]:
            compositions.update({comp_name:pnl.CompositionRegistry[cat][1][comp_name]})
    components = {i.name: i for i in namespace if isinstance(i, pnl.Component)}
    pnl_container.pnl_objects['compositions'].update(compositions)
    pnl_container.pnl_objects['components'].update(components)
    return compositions, components

def get_graphics_dict(namespace):
    if 'pnlv_graphics_spec' in namespace:
        pnl_container.graphics_spec = namespace['pnlv_graphics_spec']

def load_style(filepath):
    file = open(filepath, 'r').read()
    ast = redbaron.RedBaron(file)
    gdict = ast.find('assign',lambda x: x.find('name','pnlv_graphics_spec'))
    namespace = {}
    if gdict:
        exec(gdict.dumps(), namespace)
        pnl_container.graphics_spec = namespace['pnlv_graphics_spec']
    else:
        pnl_container.graphics_spec = {}

def load_script(filepath):
    pnl_container.filepath = filepath
    pnl_container.AST = open(filepath, 'r').read()
    dg = ast_parse.DependencyGraph(pnl_container.AST, pnl)
    namespace = {}
    dg.execute_ast(namespace)
    get_new_pnl_objects(namespace)
    get_graphics_dict(namespace)
    return pnl_container.hashable_pnl_objects['compositions']

def update_graphics_dict(stylesheet):
    ast = redbaron.RedBaron(pnl_container.AST)
    gdict = ast.find('assign',lambda x: x.find('name','pnlv_graphics_spec'))
    stylesheet_str = json.dumps(stylesheet, indent=4)
    if gdict:
        gdict.value = stylesheet_str
        ast = ast.dumps()
    else:
        ast = ast.dumps() + f'\n# PsyNeuLinkView Graphics Info \npnlv_graphics_spec = {stylesheet_str}\n'
    pnl_container.AST = ast
    with open(pnl_container.filepath, 'w') as script:
        script.write(ast)

def get_gv_json(name):
    def etree_to_dict(t):
        d = {t.tag: {} if t.attrib else None}
        children = list(t)
        if children:
            dd = defaultdict(list)
            for dc in map(etree_to_dict, children):
                for k, v in dc.items():
                    dd[k].append(v)
            d = {t.tag: {k:v[0] if len(v) == 1 else v for k, v in dd.items()}}
        if t.attrib:
            d[t.tag].update(('@' + k, v) for k, v in t.attrib.items())
        if t.text:
            text = t.text.strip()
            if children or t.attrib:
                if text:
                  d[t.tag]['#text'] = text
            else:
                d[t.tag] = text
        return d

    def correct_dict(svg_dict):
        for i in list(svg_dict.keys()):
            if '{http://www.w3.org/2000/svg}' in i:
                svg_dict[i.replace('{http://www.w3.org/2000/svg}', '')] = svg_dict[i]
                if isinstance(svg_dict[i], dict):
                    correct_dict(svg_dict[i])
                elif isinstance(svg_dict[i], list):
                    for j in svg_dict[i]:
                        if isinstance(j, dict):
                            correct_dict(j)
                del svg_dict[i]
            elif '@' == i[0]:
                svg_dict[i[1:]] = svg_dict[i]
                del svg_dict[i]

    def parse_corrected_dict(corrected_dict):
        objects = []
        edges = []
        for i in corrected_dict['svg']['g']['g']:
            if i['class'] == 'node':
                objects.append(i)
            elif i['class'] == 'edge':
                tail_str, head_str = i['title'].split('->')
                del i['title']
                i['tail'] = [i for i in range(len(objects)) if objects[i]['title'] == tail_str][0]
                i['head'] = [i for i in range(len(objects)) if objects[i]['title'] == head_str][0]
                edges.append(i)
        return {
            'objects':objects,
            'edges':edges
        }

    comp = name
    pnl_container.pnl_objects['compositions'][comp]._analyze_graph()
    gv = pnl_container.pnl_objects['compositions'][comp].show_graph(output_fmt='gv',
                                                                    show_learning=False,
                                                                    show_controller=True
                                                                    )
    gv_svg = gv.pipe(format='svg')
    gv_svg_dict = etree_to_dict(fromstring(gv_svg.decode()))
    correct_dict(gv_svg_dict)
    gv_d = parse_corrected_dict(gv_svg_dict)
    gv_d['max_x'] = float(gv_svg_dict['svg']['width'].replace('pt',''))
    gv_d['max_y'] = float(gv_svg_dict['svg']['height'].replace('pt', ''))
    return gv_d

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=2))
    graph_pb2_grpc.add_ServeGraphServicer_to_server(GraphServer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print('PYTHON SERVER READY')
    server.wait_for_termination()


if __name__ == '__main__':
    serve()