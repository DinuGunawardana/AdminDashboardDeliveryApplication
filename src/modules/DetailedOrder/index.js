import { Card, Descriptions, Divider, List, Button, Tag, Spin } from "antd";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DataStore } from "aws-amplify";
import { Order, OrderDish, OrderStatus, Restaurant, User, Dish, Courier } from "../../models";

const statusToColor = {
  [OrderStatus.NEW]: "green",
  [OrderStatus.COOKING]: "orange",
  [OrderStatus.READY_FOR_PICKUP]: "red",
  [OrderStatus.ACCEPTED]: "purple",
};

const DetailedOrder = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [res, setRes] = useState(null);
  const [dishes, setDishes] = useState();
  const [orderDish, setOrderDish] = useState([]);
  const [dishList, setDishList] = useState([]);
  const [courier, setCourier] = useState(null);

  useEffect (() => {
    const fetchOrder = async () => {
      const orderResponse = await  DataStore.query(Order, id);
      //  console.log('order', orderResponse);
       setOrder(orderResponse)

       // ideally fetch all data here to avoid unnecessary rerenders
       // and check if the response user is different from previous use to prevent refetch of user
       if(orderResponse?.userID) {
          const customerResponse = await DataStore.query(User, orderResponse.userID);
          // console.log('user', customerResponse);
          setCustomer(customerResponse);
       }

       if(orderResponse?.orderRestaurantId) {
        const restaurantResponse = await DataStore.query(Restaurant, orderResponse.orderRestaurantId);
        // console.log('restaurant', restaurantResponse);
        setRes(restaurantResponse);
       }

       if(orderResponse?.id) {
        const dishResponse = await DataStore.query(OrderDish, (c) => c.orderID?.eq(orderResponse.id));
        // console.log('dish', dishResponse);
        setDishes(dishResponse);
       }

       if(orderResponse?.orderCourierId) {
        const courierResponse = await DataStore.query(Courier, orderResponse?.orderCourierId);
        // console.log('courier', courierResponse);
        setCourier(courierResponse);
       }

    }
    fetchOrder();
  }, [id]);

  useEffect (() => {
      dishes?.map((orderdishItem) => (
        setOrderDish(orderdishItem)
      )
    )
  },)

  // useEffect (() => {
  //     dishes?.map((orderdishItem) => (
  //       console.log(orderdishItem)
  //       // setOrderDish(orderdishItem)
  //     )
  //   )
  // },)

  console.log(orderDish);

  useEffect(() => {
    if (orderDish?.orderDishDishId) {
      DataStore.query(Dish, orderDish?.orderDishDishId).then(setDishList);
    }
  }, [orderDish?.orderDishDishId]);

  // console.log(orderDish);

    // async function getOrderDish() {
    //   let orderDishResponse = await DataStore.query(OrderDish, dishes?.orderDishDishId)
    //   console.log(orderDishResponse);
    // }

    // getOrderDish();

    // useEffect(() => {
    //   (async () => {
    //     const orderDishResponse = await Promise.all(dishes?.map ((orderdishItem) => DataStore.query()))

    //     if(dishes?.orderDishDishId) {
    //       const orderDishResponse = await DataStore.map(Dish, dishes?.orderDishDishId);
    //       console.log('courier', orderDishResponse);
    //       setDishList(orderDishResponse);
    //     }
    //   })();
    // }, [dishes?.orderDishDishId])


  const acceptOrder = async () => {
    updateOrderStatus(OrderStatus.COOKING);
  };

  const declineOrder = async () => {
    updateOrderStatus(OrderStatus.DECLINED_BY_RESTAURANT);
  };

  const readyForPickup = async () => {
    updateOrderStatus(OrderStatus.READY_FOR_PICKUP);
  };

  const updateOrderStatus = async (newStatus) => {
    const updatedOrder = await DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = newStatus;
      })
    );
    setOrder(updatedOrder);
  };

  if (!order) {
    return <Spin size="large" />;
  }

  return (
    <Card title={`Order ${id}`} style={{ margin: 20 }}>
      <Tag color={statusToColor[order?.status]}>{order?.status}</Tag>
      <Descriptions bordered column={{ lg: 1, md: 1, sm: 1 }}>
        <Descriptions.Item label="Customer">{customer?.name}</Descriptions.Item>
        <Descriptions.Item label="Customer Contact No.">
          {customer?.telno}
        </Descriptions.Item>
        <Descriptions.Item label="Customer Address">
          {customer?.address}
        </Descriptions.Item>
        <Descriptions.Item label="Restaurant">
          {res?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Courier">
          {courier?.name}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <List
        dataSource={dishes}
        renderItem={(dishItem) => (
          <List.Item>
            <div style={{ fontWeight: "bold" }}>
               {dishItem?.orderDishDishId} x {dishItem?.quantity}
            </div>
            <div>Rs. {dishList.price}</div>
          </List.Item>
        )}
      />
      <Divider />
      <div style={styles.totalSumContainer}>
        <h4>Delivery Fee:</h4>
        <h3 style={styles.totalPrice}>Rs. {order?.deliveryFee?.toFixed(2)}</h3>
      </div>
      <div style={styles.totalSumContainer}>
        <h4>Total Distance:</h4>
        <h3 style={styles.totalPrice}>{order?.totalKM?.toFixed(2)} KM </h3>
      </div>
      <Divider />
      
      <Divider />
      <div style={styles.totalSumContainer}>
        <h2>Total:</h2>
        <h2 style={styles.totalPrice}>Rs. {order?.total?.toFixed(2)}</h2>
      </div>
      <Divider />
      {order.status === OrderStatus.NEW && (
        <div style={styles.buttonsContainer}>
          <Button
            block
            type="danger"
            size="large"
            style={styles.button}
            onClick={declineOrder}
          >
            Decline Order
          </Button>
          <Button
            block
            type="primary"
            size="large"
            style={styles.button}
            onClick={acceptOrder}
          >
            Accept Order
          </Button>
        </div>
      )}
      {order.status === OrderStatus.COOKING && (
        <Button block type="primary" size="large" onClick={readyForPickup}>
          Food Is Done
        </Button>
      )}
    </Card>
  );
};

const styles = {
  totalSumContainer: {
    flexDirection: "row",
    display: "flex",
  },
  totalPrice: {
    marginLeft: "auto",
    fontWeight: "bold",
  },
  buttonsContainer: {
    display: "flex",
    paddingBottom: 30,
  },
  button: {
    marginRight: 20,
    marginLeft: 20,
  },
};

export default DetailedOrder;


