**REQUIREMENTS**

Python 2.x on path (for compiling gRPC binaries for use with electron)
    
    to install: brew install python@2
    
node.js on path
    
    to install: brew install node

yarn on path
    
    to install: brew install yarn

Python 3.x with PsyNeuLink (pip install psyneulink), RedBaron (pip install redbaron), gRPC (pip install grpcio), 
and gRPC tools (pip install grpcio-tools) installed (does not need to be on path)

    
**INSTALLATION**

To install PsyneuLinkView, either:
    
    Run the install.sh script, located on the top level of the PNLV repo. 
    This will attempt to install all requirements and the PNLV package.
        
    NOTE: You may have to set the script as executable using the command
    "chmod +x install.sh". 
    
    or
    
    After installing requirements listed above, navigate to the 
    top level of the PNLV repo in your terminal and execute the command
    "yarn"


**RUNNING**

After installing:

1. Open the config.ini file in the top level of the PsyNeuLinkView directory.
2. In the interpreterPath field, enter the path to the binary of the python 
interpreter used with PsyNeuLink.

**The following instruction only applies if you use PsyNeuLink without having installed 
to your interpreter's site-packages (e.g. through pip or the setup.py install file)**

3. In the psyneulink_path field, enter the path to your local copy of the psyneulink
repo.


Run the start.sh script, located on the top level of the PNLV repo.

    NOTE: You may have to set the script as executable using the command
    "chmod +x start.sh".
        
or

In your terminal, navigate to the top level of the PNLV repo and execute the command 
"yarn electron-dev"              