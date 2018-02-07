docker build -t my-temp-graph . && docker run -p 8000:8000 -it --rm --network=host --name my-running-temp-graph my-temp-graph
