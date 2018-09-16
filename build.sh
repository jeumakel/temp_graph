docker build -t my-temp-graph-serve . && docker run -p 8000:8000 -dt --restart=unless-stopped --network=host --name my-running-temp-graph-serve my-temp-graph-serve
