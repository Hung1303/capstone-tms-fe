import { Button, Card, Divider, Empty, List, Space, Typography, message } from "antd"
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { useEffect, useMemo } from "react"
import { useCart } from "../../hooks/useCart"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../config/axios"

const formatCurrency = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0)

const CartPage = () => {
  const { cartItems, removeItem, clearCart, totalTuition } = useCart()
  const navigate = useNavigate()
  const { user } = useAuth()

  const cartCountText = useMemo(() => `${cartItems.length} khóa`, [cartItems.length])

  const handleCheckout = async () => {
    if (!user) {
      message.info("Vui lòng đăng nhập để tiếp tục thanh toán")
      navigate("/login")
      return
    }

    const description = cartItems.map(item => item.title).join(", ")

    const payload = {
      amount: totalTuition,
      description: description,
      userId: user.userId
    }
    console.log("checkout payload:", payload)
    try {
      const apiResPayment = await api.post("/Payment", payload)
      console.log("apiResPayment:", apiResPayment.data)

      if (apiResPayment.data.success) {
        const paymentId = apiResPayment.data.data.id
        console.log("paymentId:", paymentId)

        try {
        const apiResponse = await api.get(`Payment/VNPAY?paymentId=${paymentId}`)
        console.log("apiResponse:", apiResponse)

        const paymentUrl = apiResponse.data.data
        window.open(paymentUrl, "_blank")

        } catch (error) {
          console.log("lỗi Payment/VNPAY:", error)
        }
      }
    } catch (error) {
      console.log("lỗi payment:", error)
    }
  }

  // Lắng nghe thông điệp từ tab VNPay
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.payment === "success") {
        clearCart()
        navigate("/payment/success");
      } else if (event.data.payment === "failed") {
        navigate("/payment/failure");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const handleEmpty = () => {
    clearCart()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Space direction="vertical" size={16} className="w-full">
        <Space className="justify-between w-full">
          <Typography.Title level={2} className="!mb-0 flex items-center gap-2">
            <ShoppingCartOutlined /> Giỏ hàng
          </Typography.Title>
          <Button onClick={() => navigate("/courses")}>Tiếp tục xem khóa học</Button>
        </Space>

        {cartItems.length === 0 ? (
          <Card>
            <Empty description="Chưa có khóa học trong giỏ" />
            <div className="mt-4">
              <Button type="primary" onClick={() => navigate("/courses")}>
                Đi đến danh sách khóa học
              </Button>
            </div>
          </Card>
        ) : (
          <Space direction="vertical" size={16} className="w-full">
            <Card
              title="Khóa học đã chọn"
              extra={cartCountText}
            >
              <List
                dataSource={cartItems}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeItem(item.id)}
                        key="remove"
                      >
                        Xóa
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={<span className="font-medium">{item.title}</span>}
                      description={
                        <Space direction="vertical" size={2}>
                          <span>Môn: {item.subject}</span>
                          <span>Học phí: {formatCurrency(item.tuitionFee)}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <Divider className="!my-2" />
              <Space align="center" className="justify-between w-full">
                <Typography.Text strong>Tổng học phí</Typography.Text>
                <Typography.Title level={4} className="!mb-0">{formatCurrency(totalTuition)}</Typography.Title>
              </Space>
              <Space className="mt-3">
                <Button danger onClick={handleEmpty}>Xóa giỏ hàng</Button>
                <Button type="default" onClick={() => navigate("/courses")}>Thêm khóa khác</Button>
              </Space>
            </Card>

            <Card title="Thanh toán">
              <Typography.Paragraph className="text-sm text-gray-600">
                Nhấn thanh toán để gửi đăng ký cho các khóa đã chọn. Bạn cần đăng nhập để hoàn tất.
              </Typography.Paragraph>
              <Button type="primary" size="large" block className="mt-3" onClick={handleCheckout}>
                Thanh toán / Đăng ký
              </Button>
            </Card>
          </Space>
        )}
      </Space>
    </div>
  )
}

export default CartPage

