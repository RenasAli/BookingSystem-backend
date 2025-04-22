#!/bin/bash

container_name=booking_mysql
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
database_name=booking_system
user=root
password=123123

docker stop $container_name && docker rm $container_name

docker run --name $container_name -e MYSQL_ROOT_PASSWORD=$password -p 3306:3306 -d mysql
echo "Starting $container_name container..."
sleep 20
echo "Container started. Creating database..."
docker exec -i $container_name mysql -uroot -p123123 -e "CREATE DATABASE ${database_name};"



if [ $? -eq 0 ]; then
    echo "Database created successfully!"
else
    echo "Error creating database."
    exit 1
fi

echo "Done!"