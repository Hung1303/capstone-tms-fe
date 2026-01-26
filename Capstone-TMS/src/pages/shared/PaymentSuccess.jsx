import { Button, Card, Result, Space, Typography, Divider } from "antd"
import { CheckCircleOutlined, HomeOutlined, ShoppingOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

const PaymentSuccess = () => {
  const navigate = useNavigate()

  // useEffect(() => {
  //   if (window.opener) {
  //     window.opener.postMessage({ payment: "success" }, "*");
  //     window.close();
  //   }
  // }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full">
        <Card className="shadow-lg">
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ fontSize: 72, color: "#52c41a" }} />}
            title={
              <Typography.Title level={2} className="!mb-2">
                Thanh toán thành công!
              </Typography.Title>
            }
            subTitle={
              <Space direction="vertical" size={8} className="w-full text-center">
                <Typography.Text type="secondary" className="text-base">
                  Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xử lý thành công.
                </Typography.Text>
              </Space>
            }
            // extra={
            //   <Space direction="vertical" size={16} className="w-full">
            //     <Space size="middle" className="w-full justify-center flex-wrap">
            //       <Button
            //         size="large"
            //         icon={<HomeOutlined />}
            //         onClick={() => navigate(-1)}
            //       >
            //         Quay về
            //       </Button>
            //     </Space>
            //   </Space>
            // }
          />
        </Card>
      </div>
    </div>
  )
}

export default PaymentSuccess

