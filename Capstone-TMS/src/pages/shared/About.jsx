import { Row, Col, Card, Typography, Button } from "antd";
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  TeamOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const About = () => {
  return (
    <div>
      {/* HERO SECTION */}
      <div
        style={{
          background: "linear-gradient(135deg, #1677ff, #13c2c2)",
          padding: "100px 80px",
          color: "#fff",
        }}
      >
        <Row>
          <Col span={14}>
            <Title style={{ color: "#fff" }}>
              TutorLink – Kết nối dạy kèm hợp pháp & minh bạch
            </Title>
            <Paragraph style={{ fontSize: 18, color: "#e6f4ff" }}>
              Nền tảng kết nối trung tâm dạy kèm được cấp phép theo Thông tư 29
              dành cho học sinh THCS & THPT.
            </Paragraph>
            <Button size="large" type="primary">
              Khám phá TutorLink
            </Button>
          </Col>
        </Row>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "80px", background: "#f5f7fa" }}>
        {/* CONTEXT */}
        <Title level={2} style={{ textAlign: "center" }}>
          Bối cảnh giáo dục hiện nay
        </Title>

        <Row gutter={24} style={{ marginTop: 40 }}>
          <Col span={12}>
            <Card hoverable>
              <Title level={4}>Yêu cầu pháp lý</Title>
              <Paragraph>
                <CheckCircleFilled style={{ color: "#52c41a" }} /> Tuân thủ Thông
                tư 29 về dạy thêm – học thêm
              </Paragraph>
              <Paragraph>
                <CheckCircleFilled style={{ color: "#52c41a" }} /> Công khai thông
                tin khóa học, học phí, lịch học
              </Paragraph>
            </Card>
          </Col>

          <Col span={12}>
            <Card hoverable>
              <Title level={4}>Thực trạng</Title>
              <Paragraph>
                <CloseCircleFilled style={{ color: "#ff4d4f" }} /> Quảng cáo tràn
                lan trên Facebook, Zalo
              </Paragraph>
              <Paragraph>
                <CloseCircleFilled style={{ color: "#ff4d4f" }} /> Phụ huynh khó
                xác minh trung tâm hợp pháp
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* PROBLEM */}
        <Title level={2} style={{ textAlign: "center", marginTop: 80 }}>
          Khoảng trống minh bạch
        </Title>
        <Paragraph style={{ textAlign: "center", fontSize: 16 }}>
          Phụ huynh và học sinh gặp khó khăn khi tìm lớp học chất lượng và hợp pháp
        </Paragraph>

        {/* SOLUTION */}
        <Row gutter={24} style={{ marginTop: 60 }}>
          <Col span={8}>
            <Card
              hoverable
              style={{ textAlign: "center" }}
            >
              <SafetyCertificateOutlined
                style={{ fontSize: 40, color: "#1677ff" }}
              />
              <Title level={4}>Xác thực cấp phép</Title>
              <Paragraph>
                Chỉ hiển thị trung tâm và giáo viên được cấp phép chính thức.
              </Paragraph>
            </Card>
          </Col>

          <Col span={8}>
            <Card hoverable style={{ textAlign: "center" }}>
              <SearchOutlined style={{ fontSize: 40, color: "#13c2c2" }} />
              <Title level={4}>Tìm kiếm dễ dàng</Title>
              <Paragraph>
                Lọc theo môn học, khối lớp, học phí, lịch học.
              </Paragraph>
            </Card>
          </Col>

          <Col span={8}>
            <Card hoverable style={{ textAlign: "center" }}>
              <TeamOutlined style={{ fontSize: 40, color: "#fadb14" }} />
              <Title level={4}>Kết nối minh bạch</Title>
              <Paragraph>
                Phụ huynh – học sinh – trung tâm kết nối trên cùng một nền tảng.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* MISSION */}
        <div style={{ marginTop: 100, textAlign: "center" }}>
          <Title level={2}>Sứ mệnh của TutorLink</Title>
          <Paragraph style={{ fontSize: 16, maxWidth: 800, margin: "0 auto" }}>
            TutorLink hướng tới xây dựng một hệ sinh thái dạy kèm minh bạch, hợp
            pháp và hiệu quả, góp phần nâng cao chất lượng giáo dục và bảo vệ
            quyền lợi của học sinh THCS & THPT.
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default About;
