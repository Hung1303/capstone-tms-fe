import { Button, Card, Result, Space, Typography, Divider, Alert } from "antd"
import { CloseCircleOutlined, HomeOutlined, ShoppingCartOutlined, ReloadOutlined } from "@ant-design/icons"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect } from "react"

const PaymentFailure = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const responseCode = searchParams.get("vnp_ResponseCode") || searchParams.get("responseCode")

  // useEffect(() => {
  //   if (window.opener) {
  //     window.opener.postMessage({ payment: "failed" }, "*");
  //     window.close();
  //   }
  // }, []);

  // Mã lỗi phổ biến từ VNPay
  const errorMessages = {
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking",
    "10": "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    "11": "Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.",
    "12": "Thẻ/Tài khoản bị khóa.",
    "13": "Nhập sai mật khẩu xác thực giao dịch (OTP). Xin vui lòng thực hiện lại giao dịch.",
    "51": "Tài khoản không đủ số dư để thực hiện giao dịch.",
    "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
    "75": "Ngân hàng thanh toán đang bảo trì.",
    "79": "Nhập sai mật khẩu thanh toán quá số lần quy định.",
    "99": "Lỗi không xác định được"
  }

  const getErrorMessage = () => {
    if (responseCode && errorMessages[responseCode]) {
      return errorMessages[responseCode]
    }
    return "Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục."
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full">
        <Card className="shadow-lg">
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ fontSize: 72, color: "#ff4d4f" }} />}
            title={
              <Typography.Title level={2} className="!mb-2">
                Thanh toán thất bại
              </Typography.Title>
            }
            subTitle={
              <Space direction="vertical" size={12} className="w-full text-center">
                <Typography.Text type="secondary" className="text-base">
                  {getErrorMessage()}
                </Typography.Text>
                {responseCode && (
                  <Typography.Text type="secondary" className="text-sm">
                    Mã lỗi: <span className="font-mono font-semibold">{responseCode}</span>
                  </Typography.Text>
                )}
              </Space>
            }
            extra={
              <Space direction="vertical" size={16} className="w-full">
                <Alert
                  message="Lưu ý"
                  description="Nếu số tiền đã bị trừ khỏi tài khoản của bạn, vui lòng liên hệ với chúng tôi để được hỗ trợ hoàn tiền."
                  type="warning"
                  showIcon
                  className="mb-2"
                />
                
                <Space size="middle" className="w-full justify-center flex-wrap">
                  <Button
                    size="large"
                    icon={<HomeOutlined />}
                    onClick={() => navigate(-1)}
                  >
                    Quay về
                  </Button>
                </Space>
              </Space>
            }
          />
        </Card>
        
        <Card className="!mt-4 !shadow-sm">
          <Space direction="vertical" size={12} className="w-full">
            <Typography.Text strong className="text-base">Các nguyên nhân phổ biến:</Typography.Text>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Số dư tài khoản không đủ</li>
              <li>Nhập sai thông tin xác thực (OTP)</li>
              <li>Thẻ/Tài khoản chưa đăng ký dịch vụ thanh toán trực tuyến</li>
              <li>Giao dịch vượt quá hạn mức cho phép</li>
              <li>Ngân hàng đang bảo trì hệ thống</li>
            </ul>
            <Divider className="!my-2" />
            <Typography.Text type="secondary" className="text-sm">
              Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc hotline. 
              Chúng tôi sẽ hỗ trợ bạn trong thời gian sớm nhất.
            </Typography.Text>
          </Space>
        </Card>
      </div>
    </div>
  )
}

export default PaymentFailure

