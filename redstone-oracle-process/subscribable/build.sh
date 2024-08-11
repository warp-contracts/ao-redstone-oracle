#!/bin/bash

/opt/homebrew/bin/amalg.lua -s process.lua -o build/process.lua subscribable

# prepend resets to the output file
cat reset-modules.lua | cat - build/process.lua > temp && mv temp build/process.lua