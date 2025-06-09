#!/bin/bash

container_name=booking_mysql
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
database_name=booking_system
test_database_name=test_booking_system
user=root
password=123123

docker stop $container_name && docker rm $container_name

docker run --name $container_name -e MYSQL_ROOT_PASSWORD=$password -p 3306:3306 -d mysql
echo "Starting $container_name container..."

echo "Waiting for MySQL to be ready..."
until docker exec -i $container_name mysql -uroot -p$password -e "SELECT 1;" &> /dev/null
do
    echo -n "."
    sleep 2
done
echo "MySQL is ready!"

docker exec -i $container_name mysql -uroot -p$password -e "SET GLOBAL event_scheduler = ON;"

echo "Creating database..."
docker exec -i $container_name mysql -uroot -p$password -e "CREATE DATABASE ${database_name};"
docker exec -i $container_name mysql --user="${user}" --database="${database_name}" --password="${password}" < "${script_dir}/SQL/booking_system.sql"

docker exec -i $container_name mysql --user="${user}" --database="${database_name}" --password="${password}" < "${script_dir}/SQL/create_event.sql"

if [ $? -eq 0 ]; then
    echo "Database created successfully!"
    npx ts-node src/config/seeders/allData.ts
    # Remember to delete admin seeding when deploying to production
    npx ts-node src/config/seeders/adminUser.ts
    npx ts-node src/config/seeders/secondCompany.ts
else
    echo "Error creating database."
    exit 1
fi
docker exec -i $container_name mysql -uroot -p$password -e "CREATE DATABASE ${test_database_name};"
echo "Done!"