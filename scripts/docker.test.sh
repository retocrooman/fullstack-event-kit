#!/bin/bash

# Receive the path of the Dockerfile and the environment file as arguments
dockerfile_path=$1
env_path=$2

# Get the environment variables from the file and convert them to build arguments and run arguments
build_args=$(grep -v '^#' $env_path | awk -F'=' '{print "--build-arg " $1 "=\"" $2 "\""}' | xargs)
echo "Build arguments: $build_args"
run_args=$(grep -v '^#' $env_path | awk -F'=' '{print "-e " $1 "=\"" $2 "\""}' | xargs)
echo "Run arguments: $run_args"

# Build the Docker image
docker build $build_args -t test-app -f $dockerfile_path --network=host .

# Check if the build was successful
if [ $? -ne 0 ]; then
  echo "Docker build failed."
  exit 1
fi

# Run the Docker container
container_id=$(docker run $run_args -d test-app)

# Check if the container was started successfully
if [ -z "$container_id" ]; then
  echo "Failed to start the container."
  exit 1
fi

echo "Container started with ID: $container_id"

# Wait for the application to start
sleep 10

# Check the logs for any errors
if ! docker logs $container_id ; then
  echo "Application did not start successfully."
  exit
fi

# Stop and remove the container
docker stop $container_id
docker rm $container_id

echo "Test completed successfully."
