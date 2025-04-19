# Instalación cluster 2 nodos con Docker Desktop
## _Cassandra_
1. Crear network para cluster:
    ```
    docker network create cassandra-cluster
    ```

2. Crear primer container (nodo):*
    ```
    docker run -d `
    --name cassandra-node1 `
    --hostname cassandra-node1 `
    --network cassandra-cluster `
    -p 9042:9042 `
    -e MAX_HEAP_SIZE=1024M `
    -e HEAP_NEWSIZE=200M `
    -e CASSANDRA_CLUSTER_NAME=CassandraCluster `
    -e CASSANDRA_LISTEN_ADDRESS=cassandra-node1 `
    -e CASSANDRA_BROADCAST_ADDRESS=cassandra-node1 `
    -e CASSANDRA_BROADCAST_RPC_ADDRESS=cassandra-node1 `
    cassandra:4.1
    ```

3. Crear segundo container y conectarlo al primero:*
    ```
    docker run -d `
    --name cassandra-node2 `
    --hostname cassandra-node2 `
    --network cassandra-cluster `
    -p 9043:9042 `
    -e MAX_HEAP_SIZE=1024M `
    -e HEAP_NEWSIZE=200M `
    -e CASSANDRA_CLUSTER_NAME=CassandraCluster `
    -e CASSANDRA_LISTEN_ADDRESS=cassandra-node2 `
    -e CASSANDRA_BROADCAST_ADDRESS=cassandra-node2 `
    -e CASSANDRA_BROADCAST_RPC_ADDRESS=cassandra-node2 `
    -e CASSANDRA_SEEDS=cassandra-node1 `
    cassandra:4.1
    ```

4. Probar cluster (Deben de darle chance, como 1 - 3 minutos, para que se muestren los dos. De lo contrario les aparecera solo el primer nodo):
    ```
    docker exec -it cassandra-node1 nodetool status
    ```

*_Nota: Para la creación de los nodos, copiar todo el codigo de golpe y pegarlo en la terminal, NO SE COPIA LÍNEA POR LÍNEA._

## _Redis_

1. Hacer `pull` de la imagen más reciente de Redis:
    ```
    docker pull redis
    ```
2. Crear la `network` para los nodos del cluster:
    ```
    docker network create redis-cluster
    ```
3. Crear los containers (nodos) ya con la opción de clustering activada:
    - Primer container:
        ```
        docker run -d --name redis-node1 --network redis-cluster redis redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
        ```
    - Segundo container:
        ```
        docker run -d --name redis-node2 --network redis-cluster redis redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
        ```

4. Crear el cluster:
    - Obtener la IP del segundo nodo con `docker inspect`:
        ```
        docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis-node2
        ```
    - Acceder al primer nodo usando `redis-cli`:
        ```
        docker exec -it redis-node1 redis-cli
        ```
    - Finalmente, usar `CLUSTER MEET` para conectar el segundo nodo al primero:
        ```
        CLUSTER MEET <IP of redis-node2> 6379
        ```
5. Para asegurarse que esten conectados los nodos, se debe entrar a `containers`, luego a `redis-node1`, entrar a `Exec` y meter la siguiente linea de comando:
    ```
    redis-cli cluster nodes

    ```
