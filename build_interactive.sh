docker build -t my-temp-graph-serve . && docker run -p 8000:8000 -it --rm --network=host --name my-running-temp-graph-serve my-temp-graph-serve
