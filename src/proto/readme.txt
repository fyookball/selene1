The proto definition file resides in protobuf/fusion.proto.

After installing protobufjs tools, you can build the generated file src/proto/fusion.js with these commands:

npm install -g protobufjs-cli

from the top level folder:
 
 pbjs -t static-module -w es6 -o ./src/proto/fusion.js ./protobuf/fusion.proto 
   
Note: This uses the es6 flag instead of commonjs.  (Seems to be less problematic for now.   Loading the protobuf into the webview can have issues.)

