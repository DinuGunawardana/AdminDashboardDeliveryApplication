import { Form, Input, Button, Card, InputNumber, message } from "antd";
import { DataStore } from "aws-amplify";
import { Dish } from "../../models";
import { useRestaurantContext } from "../../contexts/RestaurantContext";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useState } from "react";

const { TextArea } = Input;

const CreateMenuItem = () => {
  const { restaurant } = useRestaurantContext();
  const navigation = useNavigate();

  var category = [
    {
      value: 1,
      label: "FOODS"
    },
    {
      value: 2,
      label: "BUNS_AND_CAKES"
    },
    {
      value: 3,
      label: "DRINKS"
    },
    {
      value: 4,
      label: "OTHERS"
    },
    {
      value: 5,
      label: "SPECIAL_OFFERS"
    },
  ];

  const [foodcategory, setCategory] = useState(category.label);

  const categoryhandler = e => 
  {
    setCategory(e.label);
  }

  const onFinish = ({ name, image, description, price }) => {
    DataStore.save(
      new Dish({
        name,
        image,
        description,
        price,
        restaurantID: restaurant.id,
        category: foodcategory,
      })
    );
    message.success("Dish was created");
    navigation("/menu");
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Card title="New Menu Item" style={{ margin: 20 }}>
      <Form
        layout="vertical"
        wrapperCol={{ span: 8 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Dish Name"
          name="name"
          rules={[{ required: true }]}
          required
        >
          <Input placeholder="Enter dish name" />
        </Form.Item>
        <Form.Item
          label="Dish Image"
          name="image"
          // rules={[{ required: true }]}
          // required
        >
          <Input placeholder="Enter dish image" />
        </Form.Item>
        <Form.Item
          label="Dish Description"
          name="description"
          rules={[{ required: true }]}
          required
        >
          <TextArea rows={4} placeholder="Enter dish description" />
        </Form.Item>
        <Form.Item
          label="Price (Rs.)"
          name="price"
          rules={[{ required: true }]}
          required
        >
          <InputNumber />
        </Form.Item>
        <Form.Item>
          <Select options={category} onChange={categoryhandler}/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateMenuItem;
