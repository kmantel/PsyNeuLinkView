**REQUIREMENTS**

Python 2.x on path (for compiling gRPC binaries for use with electron)
    
    to install: brew install python@2
    
node.js on path
    
    to install: brew install node

yarn on path
    
    to install: brew install yarn

Python 3.x with PsyNeuLink, RedBaron, and gRPC installed (does not need to be on path)
    
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

After installing, to run PsyNeuLinkView, either:
    
Run the start.sh script, located on the top level of the PNLV repo.

    NOTE: You may have to set the script as executable using the command
    "chmod +x start.sh".
          
or

In your terminal, navigate to the top level of the PNLV repo and execute the command 
"yarn electron-dev"              