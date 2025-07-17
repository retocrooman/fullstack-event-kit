#!/bin/bash

# Remove node_modules
find "." -type d -name "node_modules" -depth -exec rm -rf {} \;
