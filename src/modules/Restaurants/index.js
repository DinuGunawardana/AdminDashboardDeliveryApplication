import { useState, useEffect } from "react";
import { Card, Table, Popconfirm, Button } from "antd";

import { DataStore } from "aws-amplify";
import { Restaurant } from "../../models";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  

  useEffect(() => {
    DataStore.query(Restaurant).then(setRestaurants);
  }, []);

  const deleteRestaurant = (restaurant) => {
    DataStore.delete(restaurant);
    setRestaurants(restaurants.filter((d) => d.id !== restaurant.id));
  };

  const tableColumns = [
    {
      title: "Restaurant Name",
      dataIndex: "name",
      key: "name",
    },
    {
        title: "Address",
        dataIndex: "address",
        key: "address",
      },
    {
      title: "Created at",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Admin",
      dataIndex: "adminSub",
      key: "adminSub",
    },
    {
        title: "Action",
        key: "action",
        render: (_, item) => (
          <Popconfirm
            placement="topLeft"
            title={"Are you sure you want to delete this restaurant?"}
            onConfirm={() => deleteRestaurant(item)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Remove</Button>
          </Popconfirm>
        ),
      },
  ];

  return (
    <Card title={"Restaurants"} style={{ margin: 20 }}>
      <Table
        dataSource={restaurants}
        columns={tableColumns}
        rowKey="id"
      />
    </Card>
  );
};

export default Restaurants;
