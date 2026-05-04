/**
 * ERP SAP S4 HANA 上线模拟演练系统
 * 文档生成器 - 生成标准 ERP 项目文档模板
 */

const DocumentGenerator = {
  /**
   * 生成文档
   * @param {string} docId - 文档 ID
   * @returns {string} HTML 格式的文档内容
   */
  generate(docId) {
    const gameData = GameData.getGameData();
    const project = gameData.project;
    const currentDate = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const templates = {
      // ===== Chapter 1: Discover =====
      'DOC-001': this.generateBusinessCase(project, currentDate),
      'DOC-002': this.generateFeasibilityStudy(project, currentDate),
      'DOC-003': this.generateVendorEvaluation(project, currentDate),
      'DOC-004': this.generateROIAnalysis(project, currentDate),
      'DOC-005': this.generateProjectCharter(project, currentDate),

      // ===== Chapter 2: Prepare =====
      'DOC-006': this.generateOrgStructure(project, currentDate),
      'DOC-007': this.generateProjectMasterPlan(project, currentDate),
      'DOC-008': this.generateKickoffMaterial(project, currentDate),
      'DOC-009': this.generateCommunicationPlan(project, currentDate),
      'DOC-010': this.generateChangeManagementProcess(project, currentDate),
      'DOC-011': this.generateTechnicalArchitecture(project, currentDate),

      // ===== Chapter 3: Explore =====
      'DOC-012': this.generateAsIsProcess(project, currentDate),
      'DOC-013': this.generateRequirementSpec(project, currentDate),
      'DOC-014': this.generateFitGapAnalysis(project, currentDate),
      'DOC-015': this.generateToBeProcess(project, currentDate),
      'DOC-016': this.generateBlueprintSignoff(project, currentDate),

      // ===== Chapter 4: Realize =====
      'DOC-017': this.generateSystemConfiguration(project, currentDate),
      'DOC-018': this.generateDevelopmentSpec(project, currentDate),
      'DOC-019': this.generateDataMigrationPlan(project, currentDate),
      'DOC-020': this.generateUnitTestReport(project, currentDate),
      'DOC-021': this.generateIntegrationTestReport(project, currentDate),
      'DOC-022': this.generateSecurityRoles(project, currentDate),

      // ===== Chapter 5: Deploy =====
      'DOC-023': this.generateUATReport(project, currentDate),
      'DOC-024': this.generateTrainingMaterial(project, currentDate),
      'DOC-025': this.generateUserManual(project, currentDate),
      'DOC-026': this.generateMasterDataImport(project, currentDate),
      'DOC-027': this.generateCutoverChecklist(project, currentDate),
      'DOC-028': this.generateCutoverPlan(project, currentDate),
      'DOC-029': this.generateContingencyPlan(project, currentDate),
      'DOC-030': this.generateGoLiveSignoff(project, currentDate),

      // ===== Chapter 6: Run =====
      'DOC-031': this.generateIssueLog(project, currentDate),
      'DOC-032': this.generateSupportProcess(project, currentDate),
      'DOC-033': this.generatePerformanceReport(project, currentDate),
      'DOC-034': this.generateHandoverDocument(project, currentDate),
      'DOC-035': this.generateProjectSummary(project, currentDate),
      'DOC-036': this.generateAcceptanceReport(project, currentDate),
      'DOC-037': this.generateContinuousImprovement(project, currentDate)
    };

    return templates[docId] || '<p>文档模板不存在</p>';
  },

  // ============================================
  // Chapter 1: Discover 文档模板
  // ============================================

  generateBusinessCase(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">业务案例分析报告</div>
        <div class="doc-meta">
          <div>文档编号：DOC-001-BC-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
          <div>编制单位：${project.company}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 执行摘要</div>
        <div class="doc-content">
          <p>本报告旨在分析 ${project.company} 实施 ERP 系统的业务案例，明确项目必要性、预期收益和投资回报。经过全面评估，建议启动 SAP S4 HANA ERP 实施项目。</p>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 业务痛点分析</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>序号</th>
              <th>痛点领域</th>
              <th>具体描述</th>
              <th>影响程度</th>
            </tr>
            <tr>
              <td>1</td>
              <td>数据孤岛</td>
              <td>各业务系统数据独立，无法实时共享和汇总</td>
              <td>高</td>
            </tr>
            <tr>
              <td>2</td>
              <td>流程割裂</td>
              <td>跨部门流程依赖人工传递，效率低下且易出错</td>
              <td>高</td>
            </tr>
            <tr>
              <td>3</td>
              <td>报表滞后</td>
              <td>管理报表需手工汇总，T+3 天才能出具</td>
              <td>中</td>
            </tr>
            <tr>
              <td>4</td>
              <td>库存不准</td>
              <td>库存数据实时更新不足，影响生产和采购决策</td>
              <td>高</td>
            </tr>
            <tr>
              <td>5</td>
              <td>成本核算粗</td>
              <td>无法按产品/订单精确核算成本</td>
              <td>中</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">3. 项目目标</div>
        <div class="doc-content">
          <h4>3.1 业务目标</h4>
          <ul>
            <li>实现业财一体化，财务结账时间从 7 天缩短至 3 天</li>
            <li>库存准确率提升至 98% 以上</li>
            <li>订单交付周期缩短 20%</li>
            <li>实现产品级成本核算，支持精准定价决策</li>
          </ul>

          <h4 style="margin-top: 15px;">3.2 技术目标</h4>
          <ul>
            <li>建立统一的 ERP 平台，整合现有 5 个独立系统</li>
            <li>实现移动端审批和查询功能</li>
            <li>建立数据仓库，支持 BI 分析</li>
          </ul>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">4. 预期收益</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>收益类别</th>
              <th>具体描述</th>
              <th>量化指标</th>
            </tr>
            <tr>
              <td>直接收益</td>
              <td>减少手工操作，降低人工成本</td>
              <td>年节约 200 万元</td>
            </tr>
            <tr>
              <td>直接收益</td>
              <td>降低库存占用</td>
              <td>年节约资金成本 500 万元</td>
            </tr>
            <tr>
              <td>间接收益</td>
              <td>提升客户满意度</td>
              <td>订单交付及时率提升至 95%</td>
            </tr>
            <tr>
              <td>间接收益</td>
              <td>提升管理决策效率</td>
              <td>报表出具时间缩短 70%</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">5. 建议与结论</div>
        <div class="doc-content">
          <p>基于以上分析，${project.company} 实施 ERP 系统具有明确的业务必要性和经济可行性。建议尽快启动项目，预计投资回收期为 2.5 年。</p>
        </div>
      </div>

      <div class="doc-footer">
        <div class="signature-block">
          <div>编制人：______________</div>
          <div class="signature-line">日期</div>
        </div>
        <div class="signature-block">
          <div>审核人：______________</div>
          <div class="signature-line">日期</div>
        </div>
        <div class="signature-block">
          <div>批准人：______________</div>
          <div class="signature-line">日期</div>
        </div>
      </div>
    `;
  },

  generateFeasibilityStudy(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">可行性研究报告</div>
        <div class="doc-meta">
          <div>文档编号：DOC-002-FS-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 项目概述</div>
        <div class="doc-content">
          <p>本项目旨在为 ${project.company} 实施 SAP S4 HANA ERP 系统，覆盖财务、采购、销售、生产、库存等核心业务流程。</p>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 技术可行性</div>
        <div class="doc-content">
          <h4>2.1 技术成熟度</h4>
          <p>SAP S4 HANA 是 SAP 公司最新一代 ERP 产品，基于 HANA 内存数据库，技术架构成熟，全球已有超过 20,000 家成功客户。</p>

          <h4 style="margin-top: 15px;">2.2 基础设施要求</h4>
          <table class="doc-table">
            <tr>
              <th>环境</th>
              <th>配置要求</th>
              <th>现状</th>
              <th>差距</th>
            </tr>
            <tr>
              <td>开发环境</td>
              <td>64GB RAM, 1TB SSD</td>
              <td>需采购</td>
              <td>-</td>
            </tr>
            <tr>
              <td>测试环境</td>
              <td>128GB RAM, 2TB SSD</td>
              <td>需采购</td>
              <td>-</td>
            </tr>
            <tr>
              <td>生产环境</td>
              <td>256GB RAM, 4TB SSD</td>
              <td>需采购</td>
              <td>-</td>
            </tr>
          </table>

          <h4 style="margin-top: 15px;">2.3 技术风险评估</h4>
          <ul>
            <li>数据迁移风险：历史数据清洗和迁移需要充分测试</li>
            <li>接口集成风险：与外围系统接口需要充分联调</li>
            <li>性能风险：需要进行充分的性能测试和调优</li>
          </ul>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">3. 经济可行性</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>费用类别</th>
              <th>金额（万元）</th>
              <th>备注</th>
            </tr>
            <tr>
              <td>软件许可费</td>
              <td>800</td>
              <td>SAP S4 HANA 许可</td>
            </tr>
            <tr>
              <td>实施服务费</td>
              <td>600</td>
              <td>咨询顾问费用</td>
            </tr>
            <tr>
              <td>硬件设备费</td>
              <td>200</td>
              <td>服务器、网络</td>
            </tr>
            <tr>
              <td>培训费</td>
              <td>50</td>
              <td>用户培训</td>
            </tr>
            <tr>
              <td><strong>合计</strong></td>
              <td><strong>1,650</strong></td>
              <td>-</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">4. 运营可行性</div>
        <div class="doc-content">
          <h4>4.1 组织准备度</h4>
          <ul>
            <li>高层支持：已获得 CEO 和 CFO 的明确支持</li>
            <li>项目团队：可从各部门抽调业务骨干参与</li>
            <li>变革管理：需要加强沟通和培训，减少阻力</li>
          </ul>

          <h4 style="margin-top: 15px;">4.2 资源保障</h4>
          <ul>
            <li>关键用户：各部门需指定 1-2 名关键用户全程参与</li>
            <li>IT 人员：需培养内部运维团队</li>
          </ul>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">5. 结论</div>
        <div class="doc-content">
          <p>综合技术、经济、运营三方面分析，${project.company} ERP 项目具备可行性，建议批准立项。</p>
        </div>
      </div>

      <div class="doc-footer">
        <div class="signature-block">
          <div>编制人：______________</div>
          <div class="signature-line">日期</div>
        </div>
        <div class="signature-block">
          <div>审核人：______________</div>
          <div class="signature-line">日期</div>
        </div>
      </div>
    `;
  },

  generateVendorEvaluation(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">供应商选型评估报告</div>
        <div class="doc-meta">
          <div>文档编号：DOC-003-VE-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 评估概述</div>
        <div class="doc-content">
          <p>本次评估对 3 家主流 ERP 供应商进行综合对比，包括 SAP、Oracle 和用友。评估维度包括产品功能、技术架构、实施能力、服务支持、价格等。</p>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 供应商对比</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>评估维度</th>
              <th>SAP S4 HANA</th>
              <th>Oracle ERP Cloud</th>
              <th>用友 NC Cloud</th>
            </tr>
            <tr>
              <td>产品成熟度</td>
              <td>★★★★★</td>
              <td>★★★★★</td>
              <td>★★★★☆</td>
            </tr>
            <tr>
              <td>行业最佳实践</td>
              <td>★★★★★</td>
              <td>★★★★☆</td>
              <td>★★★☆☆</td>
            </tr>
            <tr>
              <td>技术架构</td>
              <td>★★★★★</td>
              <td>★★★★☆</td>
              <td>★★★☆☆</td>
            </tr>
            <tr>
              <td>本地化支持</td>
              <td>★★★★☆</td>
              <td>★★★☆☆</td>
              <td>★★★★★</td>
            </tr>
            <tr>
              <td>实施伙伴生态</td>
              <td>★★★★★</td>
              <td>★★★★☆</td>
              <td>★★★★☆</td>
            </tr>
            <tr>
              <td>总体拥有成本</td>
              <td>高</td>
              <td>高</td>
              <td>中</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">3. 评分结果</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>供应商</th>
              <th>产品 (30%)</th>
              <th>技术 (25%)</th>
              <th>服务 (20%)</th>
              <th>价格 (15%)</th>
              <th>案例 (10%)</th>
              <th>总分</th>
            </tr>
            <tr>
              <td>SAP</td>
              <td>28</td>
              <td>23</td>
              <td>17</td>
              <td>10</td>
              <td>9</td>
              <td><strong>87</strong></td>
            </tr>
            <tr>
              <td>Oracle</td>
              <td>26</td>
              <td>21</td>
              <td>16</td>
              <td>11</td>
              <td>8</td>
              <td><strong>82</strong></td>
            </tr>
            <tr>
              <td>用友</td>
              <td>23</td>
              <td>18</td>
              <td>18</td>
              <td>13</td>
              <td>7</td>
              <td><strong>79</strong></td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">4. 选型建议</div>
        <div class="doc-content">
          <p>基于评分结果，建议选择 <strong>SAP S4 HANA</strong> 作为 ${project.company} 的 ERP 平台。主要理由：</p>
          <ul>
            <li>产品成熟度最高，行业最佳实践丰富</li>
            <li>技术架构领先，支持实时分析和 AI 能力</li>
            <li>实施伙伴生态完善，便于找到合适的实施商</li>
            <li>全球化支持好，便于未来海外扩张</li>
          </ul>
        </div>
      </div>

      <div class="doc-footer">
        <div class="signature-block">
          <div>编制人：______________</div>
          <div class="signature-line">日期</div>
        </div>
        <div class="signature-block">
          <div>审核人：______________</div>
          <div class="signature-line">日期</div>
        </div>
      </div>
    `;
  },

  generateROIAnalysis(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">投资回报分析 (ROI) 报告</div>
        <div class="doc-meta">
          <div>文档编号：DOC-004-ROI-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 投资概算</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>费用类别</th>
              <th>第 1 年</th>
              <th>第 2 年</th>
              <th>第 3 年</th>
              <th>合计</th>
            </tr>
            <tr>
              <td>软件许可</td>
              <td>800 万</td>
              <td>100 万</td>
              <td>100 万</td>
              <td>1,000 万</td>
            </tr>
            <tr>
              <td>实施服务</td>
              <td>600 万</td>
              <td>-</td>
              <td>-</td>
              <td>600 万</td>
            </tr>
            <tr>
              <td>硬件设备</td>
              <td>200 万</td>
              <td>-</td>
              <td>-</td>
              <td>200 万</td>
            </tr>
            <tr>
              <td>运维费用</td>
              <td>100 万</td>
              <td>150 万</td>
              <td>150 万</td>
              <td>400 万</td>
            </tr>
            <tr>
              <td><strong>合计</strong></td>
              <td><strong>1,700 万</strong></td>
              <td><strong>250 万</strong></td>
              <td><strong>250 万</strong></td>
              <td><strong>2,200 万</strong></td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 收益预测</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>收益类别</th>
              <th>第 1 年</th>
              <th>第 2 年</th>
              <th>第 3 年</th>
              <th>合计</th>
            </tr>
            <tr>
              <td>人工成本节约</td>
              <td>100 万</td>
              <td>200 万</td>
              <td>200 万</td>
              <td>500 万</td>
            </tr>
            <tr>
              <td>库存成本节约</td>
              <td>200 万</td>
              <td>400 万</td>
              <td>400 万</td>
              <td>1,000 万</td>
            </tr>
            <tr>
              <td>效率提升收益</td>
              <td>150 万</td>
              <td>300 万</td>
              <td>300 万</td>
              <td>750 万</td>
            </tr>
            <tr>
              <td>管理决策收益</td>
              <td>100 万</td>
              <td>200 万</td>
              <td>200 万</td>
              <td>500 万</td>
            </tr>
            <tr>
              <td><strong>合计</strong></td>
              <td><strong>550 万</strong></td>
              <td><strong>1,100 万</strong></td>
              <td><strong>1,100 万</strong></td>
              <td><strong>2,750 万</strong></td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">3. ROI 指标</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>指标</th>
              <th>数值</th>
              <th>说明</th>
            </tr>
            <tr>
              <td>总投资 (3 年)</td>
              <td>2,200 万元</td>
              <td>含软件、实施、硬件、运维</td>
            </tr>
            <tr>
              <td>总收益 (3 年)</td>
              <td>2,750 万元</td>
              <td>直接 + 间接收益</td>
            </tr>
            <tr>
              <td>净收益</td>
              <td>550 万元</td>
              <td>总收益 - 总投资</td>
            </tr>
            <tr>
              <td>投资回报率 (ROI)</td>
              <td>25%</td>
              <td>净收益 / 总投资</td>
            </tr>
            <tr>
              <td>投资回收期</td>
              <td>2.5 年</td>
              <td>累计净现金流转正的年份</td>
            </tr>
            <tr>
              <td>净现值 (NPV, 8% 折现)</td>
              <td>420 万元</td>
              <td>大于 0，项目可行</td>
            </tr>
            <tr>
              <td>内部收益率 (IRR)</td>
              <td>18%</td>
              <td>高于资金成本，项目可行</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">4. 敏感性分析</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>变量</th>
              <th>-20%</th>
              <th>基准</th>
              <th>+20%</th>
            </tr>
            <tr>
              <td>收益变动对 ROI 影响</td>
              <td>5%</td>
              <td>25%</td>
              <td>45%</td>
            </tr>
            <tr>
              <td>成本变动对 ROI 影响</td>
              <td>35%</td>
              <td>25%</td>
              <td>15%</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">5. 结论</div>
        <div class="doc-content">
          <p>项目 ROI 为 25%，投资回收期 2.5 年，NPV 为正，IRR 高于资金成本，项目经济可行。</p>
        </div>
      </div>

      <div class="doc-footer">
        <div class="signature-block">
          <div>编制人：______________</div>
          <div class="signature-line">日期</div>
        </div>
        <div class="signature-block">
          <div>审核人：______________</div>
          <div class="signature-line">日期</div>
        </div>
      </div>
    `;
  },

  generateProjectCharter(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">项目章程 (Project Charter)</div>
        <div class="doc-meta">
          <div>文档编号：DOC-005-PC-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 项目基本信息</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th width="150">项目名称</th>
              <td>${project.name}</td>
            </tr>
            <tr>
              <th>项目编号</th>
              <td>ERP-2026-001</td>
            </tr>
            <tr>
              <th>项目发起人</th>
              <td>CEO / CFO</td>
            </tr>
            <tr>
              <th>项目经理</th>
              <td>待定</td>
            </tr>
            <tr>
              <th>计划开始日期</th>
              <td>2026 年 5 月 1 日</td>
            </tr>
            <tr>
              <th>计划上线日期</th>
              <td>2027 年 4 月 1 日</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 项目背景</div>
        <div class="doc-content">
          <p>${project.company} 当前面临数据孤岛、流程割裂、报表滞后等管理痛点，现有 IT 系统已无法支撑业务发展需要。为提升管理效率、支持战略决策，决定启动 SAP S4 HANA ERP 系统实施项目。</p>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">3. 项目目标</div>
        <div class="doc-content">
          <h4>3.1 业务目标 (SMART 原则)</h4>
          <ul>
            <li>财务结账时间从 7 天缩短至 3 天</li>
            <li>库存准确率提升至 98% 以上</li>
            <li>订单交付周期缩短 20%</li>
            <li>实现 100% 的订单成本核算</li>
          </ul>

          <h4 style="margin-top: 15px;">3.2 技术目标</h4>
          <ul>
            <li>建立统一的 SAP S4 HANA 平台</li>
            <li>整合现有 5 个独立系统</li>
            <li>实现移动端审批和查询</li>
          </ul>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">4. 项目范围</div>
        <div class="doc-content">
          <h4>4.1 组织范围</h4>
          <ul>
            <li>集团总部及下属 3 家工厂</li>
            <li>覆盖部门：财务、采购、销售、生产、仓储、人力</li>
          </ul>

          <h4 style="margin-top: 15px;">4.2 模块范围</h4>
          <table class="doc-table">
            <tr>
              <th>模块</th>
              <th>说明</th>
            </tr>
            <tr>
              <td>FI (财务会计)</td>
              <td>总账、应收、应付、资产</td>
            </tr>
            <tr>
              <td>CO (管理会计)</td>
              <td>成本中心、利润中心、产品成本</td>
            </tr>
            <tr>
              <td>MM (物料管理)</td>
              <td>采购、库存、物料主数据</td>
            </tr>
            <tr>
              <td>SD (销售分销)</td>
              <td>销售、发货、开票</td>
            </tr>
            <tr>
              <td>PP (生产计划)</td>
              <td>BOM、工艺路线、生产订单</td>
            </tr>
          </table>

          <h4 style="margin-top: 15px;">4.3 排除范围</h4>
          <ul>
            <li>CRM 客户关系管理（二期考虑）</li>
            <li>SRM 供应商关系管理（二期考虑）</li>
            <li>海外公司（三期考虑）</li>
          </ul>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">5. 项目组织</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>角色</th>
              <th>人员</th>
              <th>部门</th>
              <th>职责</th>
            </tr>
            <tr>
              <td>项目发起人</td>
              <td>待指定</td>
              <td>总经办</td>
              <td>项目决策、资源协调</td>
            </tr>
            <tr>
              <td>项目总监</td>
              <td>待指定</td>
              <td>财务部</td>
              <td>项目监督、关键决策</td>
            </tr>
            <tr>
              <td>项目经理</td>
              <td>待指定</td>
              <td>IT 部</td>
              <td>项目日常管理</td>
            </tr>
            <tr>
              <td>财务顾问</td>
              <td>待指定</td>
              <td>财务部</td>
              <td>FI/CO 模块业务对接</td>
            </tr>
            <tr>
              <td>供应链顾问</td>
              <td>待指定</td>
              <td>采购/仓储</td>
              <td>MM/SD 模块业务对接</td>
            </tr>
            <tr>
              <td>生产顾问</td>
              <td>待指定</td>
              <td>生产部</td>
              <td>PP 模块业务对接</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">6. 关键里程碑</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>里程碑</th>
              <th>计划日期</th>
              <th>交付物</th>
            </tr>
            <tr>
              <td>项目启动</td>
              <td>2026-05-01</td>
              <td>项目章程、项目计划</td>
            </tr>
            <tr>
              <td>蓝图确认</td>
              <td>2026-08-01</td>
              <td>业务蓝图签字</td>
            </tr>
            <tr>
              <td>系统就绪</td>
              <td>2026-12-01</td>
              <td>集成测试报告</td>
            </tr>
            <tr>
              <td>上线切换</td>
              <td>2027-04-01</td>
              <td>上线签字确认</td>
            </tr>
            <tr>
              <td>项目验收</td>
              <td>2027-07-01</td>
              <td>项目总结报告</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">7. 预算概算</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>费用类别</th>
              <th>金额（万元）</th>
            </tr>
            <tr>
              <td>软件许可费</td>
              <td>800</td>
            </tr>
            <tr>
              <td>实施服务费</td>
              <td>600</td>
            </tr>
            <tr>
              <td>硬件设备费</td>
              <td>200</td>
            </tr>
            <tr>
              <td>培训费</td>
              <td>50</td>
            </tr>
            <tr>
              <td>预备费</td>
              <td>100</td>
            </tr>
            <tr>
              <td><strong>合计</strong></td>
              <td><strong>1,750</strong></td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">8. 审批签字</div>
        <div class="doc-content">
          <table class="doc-table" style="width: 80%;">
            <tr>
              <th>角色</th>
              <th>姓名</th>
              <th>签字</th>
              <th>日期</th>
            </tr>
            <tr>
              <td>项目发起人</td>
              <td></td>
              <td>______________</td>
              <td></td>
            </tr>
            <tr>
              <td>项目经理</td>
              <td></td>
              <td>______________</td>
              <td></td>
            </tr>
            <tr>
              <td>财务总监</td>
              <td></td>
              <td>______________</td>
              <td></td>
            </tr>
          </table>
        </div>
      </div>
    `;
  },

  // ============================================
  // Chapter 2: Prepare 文档模板
  // ============================================

  generateOrgStructure(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">项目组织结构与职责矩阵</div>
        <div class="doc-meta">
          <div>文档编号：DOC-006-OS-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 项目治理结构</div>
        <div class="doc-content">
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
                    ┌─────────────────────────────────┐
                    │      项目指导委员会 (SteerCo)    │
                    │   主席：CEO  成员：CFO/CIO 等    │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │         项目总监 (Project Director)    │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │      项目经理 (Project Manager)   │
                    └────────────────┬────────────────┘
                                     │
           ┌─────────────┬───────────┼───────────┬─────────────┐
           │             │           │           │             │
    ┌──────▼──────┐ ┌────▼────┐ ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
    │ 财务模块组  │ │供应链组 │ │ 生产组  │ │ 技术组  │ │ 变革管理│
    │ FI/CO顾问   │ │MM/SD顾问│ │PP顾问   │ │ABAP 开发 │ │ 培训组  │
    └─────────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
          </pre>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 角色职责说明</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>角色</th>
              <th>主要职责</th>
              <th>投入程度</th>
            </tr>
            <tr>
              <td>项目指导委员会</td>
              <td>项目重大决策、资源协调、风险升级处理</td>
              <td>月度会议</td>
            </tr>
            <tr>
              <td>项目总监</td>
              <td>项目整体监督、关键问题决策、跨部门协调</td>
              <td>20%</td>
            </tr>
            <tr>
              <td>项目经理</td>
              <td>项目日常管理、计划跟踪、风险管理、沟通协调</td>
              <td>100%</td>
            </tr>
            <tr>
              <td>模块顾问</td>
              <td>需求调研、方案设计、系统配置、用户培训</td>
              <td>100%</td>
            </tr>
            <tr>
              <td>关键用户</td>
              <td>参与需求调研、测试验证、知识转移</td>
              <td>50%</td>
            </tr>
            <tr>
              <td>开发工程师</td>
              <td>报表、表单、接口、增强开发</td>
              <td>100%</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">3. RACI 职责矩阵</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>活动/交付物</th>
              <th>SteerCo</th>
              <th>项目总监</th>
              <th>项目经理</th>
              <th>模块顾问</th>
              <th>关键用户</th>
            </tr>
            <tr>
              <td>项目章程审批</td>
              <td>A</td>
              <td>R</td>
              <td>C</td>
              <td>I</td>
              <td>I</td>
            </tr>
            <tr>
              <td>蓝图设计</td>
              <td>I</td>
              <td>A</td>
              <td>C</td>
              <td>R</td>
              <td>C</td>
            </tr>
            <tr>
              <td>系统配置</td>
              <td>I</td>
              <td>I</td>
              <td>C</td>
              <td>R</td>
              <td>C</td>
            </tr>
            <tr>
              <td>UAT 测试</td>
              <td>I</td>
              <td>I</td>
              <td>A</td>
              <td>C</td>
              <td>R</td>
            </tr>
            <tr>
              <td>上线决策</td>
              <td>A</td>
              <td>R</td>
              <td>C</td>
              <td>C</td>
              <td>C</td>
            </tr>
          </table>
          <p style="margin-top: 10px; font-size: 12px;">R=负责执行 A=最终批准 C=被咨询 I=被告知</p>
        </div>
      </div>

      <div class="doc-footer">
        <div class="signature-block">
          <div>编制人：______________</div>
          <div class="signature-line">日期</div>
        </div>
        <div class="signature-block">
          <div>审核人：______________</div>
          <div class="signature-line">日期</div>
        </div>
      </div>
    `;
  },

  generateProjectMasterPlan(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">项目主计划 (Project Master Plan)</div>
        <div class="doc-meta">
          <div>文档编号：DOC-007-PMP-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 项目总体计划</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>阶段</th>
              <th>开始日期</th>
              <th>结束日期</th>
              <th>工期 (周)</th>
              <th>里程碑</th>
            </tr>
            <tr>
              <td>1. 项目准备</td>
              <td>2026-05-01</td>
              <td>2026-05-31</td>
              <td>4</td>
              <td>项目启动会</td>
            </tr>
            <tr>
              <td>2. 业务蓝图</td>
              <td>2026-06-01</td>
              <td>2026-08-15</td>
              <td>11</td>
              <td>蓝图签字</td>
            </tr>
            <tr>
              <td>3. 系统实现</td>
              <td>2026-08-16</td>
              <td>2026-12-15</td>
              <td>17</td>
              <td>集成测试完成</td>
            </tr>
            <tr>
              <td>4. 上线准备</td>
              <td>2026-12-16</td>
              <td>2027-03-31</td>
              <td>15</td>
              <td>上线切换演练</td>
            </tr>
            <tr>
              <td>5. 上线护航</td>
              <td>2027-04-01</td>
              <td>2027-06-30</td>
              <td>13</td>
              <td>项目验收</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 详细子计划</div>
        <div class="doc-content">
          <h4>2.1 Design Workshop 计划</h4>
          <table class="doc-table">
            <tr>
              <th>Workshop</th>
              <th>时间</th>
              <th>参与人</th>
              <th>产出</th>
            </tr>
            <tr>
              <td>FI 财务流程研讨</td>
              <td>Week 5-6</td>
              <td>财务顾问、关键用户</td>
              <td>财务流程蓝图</td>
            </tr>
            <tr>
              <td>MM 采购流程研讨</td>
              <td>Week 7-8</td>
              <td>供应链顾问、关键用户</td>
              <td>采购流程蓝图</td>
            </tr>
            <tr>
              <td>SD 销售流程研讨</td>
              <td>Week 7-8</td>
              <td>供应链顾问、关键用户</td>
              <td>销售流程蓝图</td>
            </tr>
            <tr>
              <td>PP 生产流程研讨</td>
              <td>Week 9-10</td>
              <td>生产顾问、关键用户</td>
              <td>生产流程蓝图</td>
            </tr>
          </table>

          <h4 style="margin-top: 20px;">2.2 数据迁移计划</h4>
          <table class="doc-table">
            <tr>
              <th>数据类型</th>
              <th>清洗开始</th>
              <th>导入测试</th>
              <th>正式导入</th>
              <th>责任人</th>
            </tr>
            <tr>
              <td>组织数据</td>
              <td>2026-09-01</td>
              <td>2026-10-01</td>
              <td>2027-03-25</td>
              <td>IT 部</td>
            </tr>
            <tr>
              <td>物料主数据</td>
              <td>2026-09-15</td>
              <td>2026-11-01</td>
              <td>2027-03-26</td>
              <td>采购/仓储</td>
            </tr>
            <tr>
              <td>BOM/工艺路线</td>
              <td>2026-10-01</td>
              <td>2026-11-15</td>
              <td>2027-03-27</td>
              <td>生产/工程</td>
            </tr>
            <tr>
              <td>未清订单</td>
              <td>2026-12-01</td>
              <td>2026-01-05</td>
              <td>2027-03-28</td>
              <td>各业务部门</td>
            </tr>
            <tr>
              <td>财务余额</td>
              <td>2027-02-01</td>
              <td>2027-03-01</td>
              <td>2027-03-31</td>
              <td>财务部</td>
            </tr>
          </table>

          <h4 style="margin-top: 20px;">2.3 开发计划</h4>
          <table class="doc-table">
            <tr>
              <th>开发类型</th>
              <th>数量</th>
              <th>开始日期</th>
              <th>完成日期</th>
            </tr>
            <tr>
              <td>报表开发</td>
              <td>25 个</td>
              <td>2026-09-01</td>
              <td>2026-11-30</td>
            </tr>
            <tr>
              <td>表单开发</td>
              <td>15 个</td>
              <td>2026-09-15</td>
              <td>2026-11-15</td>
            </tr>
            <tr>
              <td>接口开发</td>
              <td>8 个</td>
              <td>2026-10-01</td>
              <td>2026-12-15</td>
            </tr>
            <tr>
              <td>增强开发</td>
              <td>10 个</td>
              <td>2026-10-15</td>
              <td>2026-12-31</td>
            </tr>
          </table>

          <h4 style="margin-top: 20px;">2.4 配置计划</h4>
          <table class="doc-table">
            <tr>
              <th>模块</th>
              <td>基线配置</td>
              <td>详细配置</td>
              <td>配置确认</td>
            </tr>
            <tr>
              <td>FI/CO</td>
              <td>2026-08-20</td>
              <td>2026-10-31</td>
              <td>2026-11-15</td>
            </tr>
            <tr>
              <td>MM</td>
              <td>2026-08-25</td>
              <td>2026-10-31</td>
              <td>2026-11-15</td>
            </tr>
            <tr>
              <td>SD</td>
              <td>2026-08-25</td>
              <td>2026-10-31</td>
              <td>2026-11-15</td>
            </tr>
            <tr>
              <td>PP</td>
              <td>2026-09-01</td>
              <td>2026-11-15</td>
              <td>2026-11-30</td>
            </tr>
          </table>

          <h4 style="margin-top: 20px;">2.5 测试计划</h4>
          <table class="doc-table">
            <tr>
              <th>测试类型</th>
              <th>开始日期</th>
              <th>结束日期</th>
              <th>参与人</th>
            </tr>
            <tr>
              <td>单元测试</td>
              <td>2026-10-01</td>
              <td>2026-11-15</td>
              <td>顾问</td>
            </tr>
            <tr>
              <td>集成测试</td>
              <td>2026-11-16</td>
              <td>2026-12-15</td>
              <td>顾问 + 关键用户</td>
            </tr>
            <tr>
              <td>UAT 测试</td>
              <td>2026-12-16</td>
              <td>2027-02-15</td>
              <td>最终用户</td>
            </tr>
            <tr>
              <td>切换演练</td>
              <td>2027-02-16</td>
              <td>2027-03-15</td>
              <td>项目组</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-footer">
        <div class="signature-block">
          <div>编制人：______________</div>
          <div class="signature-line">日期</div>
        </div>
        <div class="signature-block">
          <div>审核人：______________</div>
          <div class="signature-line">日期</div>
        </div>
      </div>
    `;
  },

  generateKickoffMaterial(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">项目启动会 (Kick-off Meeting) 材料</div>
        <div class="doc-meta">
          <div>文档编号：DOC-008-KO-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 会议信息</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>会议时间</th>
              <td>2026 年 5 月 1 日 9:00-12:00</td>
            </tr>
            <tr>
              <th>会议地点</th>
              <td>公司大会议室 + 视频会议室</td>
            </tr>
            <tr>
              <th>主持人</th>
              <td>项目经理</td>
            </tr>
            <tr>
              <th>参会人员</th>
              <td>项目指导委员会、项目组成员、关键用户代表</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 启动会议程</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>时间</th>
              <th>议程</th>
              <th>主讲人</th>
            </tr>
            <tr>
              <td>09:00-09:15</td>
              <td>开场致辞</td>
              <td>CEO</td>
            </tr>
            <tr>
              <td>09:15-09:45</td>
              <td>项目背景与目标</td>
              <td>项目总监</td>
            </tr>
            <tr>
              <td>09:45-10:15</td>
              <td>项目实施计划介绍</td>
              <td>项目经理</td>
            </tr>
            <tr>
              <td>10:15-10:30</td>
              <td>茶歇</td>
              <td>-</td>
            </tr>
            <tr>
              <td>10:30-11:00</td>
              <td>项目组织与职责</td>
              <td>项目经理</td>
            </tr>
            <tr>
              <td>11:00-11:30</td>
              <td>SAP S4 HANA 简介</td>
              <td>实施顾问</td>
            </tr>
            <tr>
              <td>11:30-11:50</td>
              <td>关键用户代表发言</td>
              <td>部门代表</td>
            </tr>
            <tr>
              <td>11:50-12:00</td>
              <td>总结与合影</td>
              <td>CEO</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">3. 项目宣言</div>
        <div class="doc-content">
          <p style="background: #e8f0fe; padding: 20px; border-radius: 5px; text-align: center; font-weight: 500;">
            "ERP 项目是一把手工程，需要全员参与、全力以赴！<br>
            我们的目标：按期、保质、预算内成功上线！"
          </p>
        </div>
      </div>

      <div class="doc-footer">
        <div class="signature-block">
          <div>编制人：______________</div>
          <div class="signature-line">日期</div>
        </div>
      </div>
    `;
  },

  // ============================================
  // 辅助方法 - 生成其他文档
  // ============================================

  generateCommunicationPlan(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">沟通管理计划</div>
        <div class="doc-meta">
          <div>文档编号：DOC-009-CP-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 沟通矩阵</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>沟通类型</th>
              <th>频率</th>
              <th>参与人</th>
              <th>形式</th>
              <th>负责人</th>
            </tr>
            <tr>
              <td>项目指导委员会</td>
              <td>月度</td>
              <td>SteerCo 成员</td>
              <td>现场会议</td>
              <td>项目总监</td>
            </tr>
            <tr>
              <td>项目周会</td>
              <td>每周</td>
              <td>项目组成员</td>
              <td>现场 + 视频</td>
              <td>项目经理</td>
            </tr>
            <tr>
              <td>模块组日会</td>
              <td>每日</td>
              <td>模块组成员</td>
              <td>站会</td>
              <td>模块组长</td>
            </tr>
            <tr>
              <td>项目周报</td>
              <td>每周</td>
              <td>全体相关人员</td>
              <td>邮件</td>
              <td>项目经理</td>
            </tr>
            <tr>
              <td>状态报告</td>
              <td>双周</td>
              <td>SteerCo 成员</td>
              <td>邮件 + 会议</td>
              <td>项目经理</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 升级机制</div>
        <div class="doc-content">
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
问题严重程度    响应时限    升级路径
─────────────────────────────────────────
P1-严重         2 小时      项目经理 → 项目总监 → SteerCo
P2-高           24 小时     模块组长 → 项目经理
P3-中           3 天        组内解决
P4-低           1 周        记录跟踪
          </pre>
        </div>
      </div>
    `;
  },

  generateChangeManagementProcess(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">变更管理流程 (Change Management Process)</div>
        <div class="doc-meta">
          <div>文档编号：DOC-010-CMP-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 变更管理组织</div>
        <div class="doc-content">
          <h4>变更控制委员会 (CCB)</h4>
          <table class="doc-table">
            <tr>
              <th>角色</th>
              <th>人员</th>
              <th>职责</th>
            </tr>
            <tr>
              <td>CCB 主席</td>
              <td>项目总监</td>
              <td>主持 CCB 会议、最终审批</td>
            </tr>
            <tr>
              <td>CCB 成员</td>
              <td>项目经理、财务负责人、业务负责人</td>
              <td>参与变更评审和决策</td>
            </tr>
            <tr>
              <td>变更协调员</td>
              <td>项目经理</td>
              <td>收集变更请求、组织评审、跟踪执行</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 变更管理流程</div>
        <div class="doc-content">
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  变更请求   │───▶│  影响分析   │───▶│  CCB 审批   │
│  (CR 提交)   │    │ (评估报告)  │    │ (批准/拒绝) │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                    ┌────────────────────────┘
                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  关闭确认   │◀───│  变更验证   │◀───│  变更执行   │
│  (签字)     │    │ (测试报告)  │    │ (实施记录)  │
└─────────────┘    └─────────────┘    └─────────────┘
          </pre>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">3. 变更请求单模板</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th colspan="4">变更请求单 (Change Request Form)</th>
            </tr>
            <tr>
              <td>CR 编号:</td>
              <td>CR-2026-XXX</td>
              <td>提交日期:</td>
              <td></td>
            </tr>
            <tr>
              <td>提交人:</td>
              <td></td>
              <td>所属模块:</td>
              <td></td>
            </tr>
            <tr>
              <td colspan="4">变更描述:</td>
            </tr>
            <tr>
              <td colspan="4" style="height: 60px;"></td>
            </tr>
            <tr>
              <td colspan="4">变更原因:</td>
            </tr>
            <tr>
              <td colspan="4" style="height: 40px;"></td>
            </tr>
            <tr>
              <td colspan="4">影响分析 (由项目组填写):</td>
            </tr>
            <tr>
              <td>进度影响:</td>
              <td>天</td>
              <td>成本影响:</td>
              <td>元</td>
            </tr>
            <tr>
              <td>质量影响:</td>
              <td colspan="3"></td>
            </tr>
            <tr>
              <td colspan="4">CCB 审批意见:</td>
            </tr>
            <tr>
              <td colspan="2">□ 批准</td>
              <td colspan="2">□ 拒绝</td>
            </tr>
            <tr>
              <td colspan="4">签字：_______________ 日期：_______________</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">4. 变更优先级定义</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>优先级</th>
              <th>定义</th>
              <th>响应时限</th>
            </tr>
            <tr>
              <td>P1-紧急</td>
              <td>影响上线或关键功能，必须立即处理</td>
              <td>24 小时内 CCB 审批</td>
            </tr>
            <tr>
              <td>P2-高</td>
              <td>影响重要业务流程，需要尽快处理</td>
              <td>1 周内 CCB 审批</td>
            </tr>
            <tr>
              <td>P3-中</td>
              <td>有业务价值，但不影响核心功能</td>
              <td>2 周内 CCB 审批</td>
            </tr>
            <tr>
              <td>P4-低</td>
              <td>优化建议，可后续版本实现</td>
              <td>月度 CCB 评审</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-footer">
        <div class="signature-block">
          <div>编制人：______________</div>
          <div class="signature-line">日期</div>
        </div>
        <div class="signature-block">
          <div>审核人：______________</div>
          <div class="signature-line">日期</div>
        </div>
      </div>
    `;
  },

  generateTechnicalArchitecture(project, date) {
    return `
      <div class="doc-header">
        <div class="doc-title">技术架构规划文档</div>
        <div class="doc-meta">
          <div>文档编号：DOC-011-TA-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">1. 系统架构</div>
        <div class="doc-content">
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
                         ┌─────────────────────────────────┐
                         │         用户访问层               │
                         │  PC 浏览器 / 移动端 / Fiori      │
                         └────────────────┬────────────────┘
                                          │
                         ┌────────────────▼────────────────┐
                         │         应用服务层               │
                         │    SAP S4 HANA Application      │
                         └────────────────┬────────────────┘
                                          │
                         ┌────────────────▼────────────────┐
                         │         数据层                   │
                         │      SAP HANA Database          │
                         └────────────────┬────────────────┘
                                          │
    ┌──────────────────────────────────────┼──────────────────────────────────────┐
    │                                      │                                      │
    ▼                                      ▼                                      ▼
┌─────────┐                         ┌─────────┐                         ┌─────────┐
│ 开发环境 │                         │ 测试环境 │                         │ 生产环境 │
│  DEV    │                         │  QAS    │                         │  PRD    │
└─────────┘                         └─────────┘                         └─────────┘
          </pre>
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">2. 基础设施配置</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr>
              <th>环境</th>
              <th>服务器配置</th>
              <th>存储</th>
              <th>网络</th>
            </tr>
            <tr>
              <td>开发环境</td>
              <td>64GB RAM, 16 Core</td>
              <td>1TB SSD</td>
              <td>内网</td>
            </tr>
            <tr>
              <td>测试环境</td>
              <td>128GB RAM, 32 Core</td>
              <td>2TB SSD</td>
              <td>内网</td>
            </tr>
            <tr>
              <td>生产环境</td>
              <td>256GB RAM, 64 Core</td>
              <td>4TB SSD (HA)</td>
              <td>DMZ+ 内网</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="doc-footer">
        <div class="signature-block">
          <div>编制人：______________</div>
          <div class="signature-line">日期</div>
        </div>
      </div>
    `;
  },

  // ============================================
  // 剩余文档模板 - 简化版
  // ============================================

  generateAsIsProcess(project, date) {
    return this._generateGenericDoc('AS-IS 流程文档', 'DOC-012', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 调研概述</div>
        <div class="doc-content">
          <p>本次调研覆盖 ${project.company} 财务、采购、销售、生产等核心业务流程，通过访谈、问卷、现场观察等方式，梳理现有业务流程现状。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 财务流程现状</div>
        <div class="doc-content">
          <h4>2.1 总账流程</h4>
          <ul>
            <li>凭证录入：手工录入为主，部分业务自动生成</li>
            <li>结账流程：月结需 7 个工作日</li>
            <li>报表出具：T+3 天</li>
          </ul>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">3. 采购流程现状</div>
        <div class="doc-content">
          <h4>3.1 采购申请</h4>
          <ul>
            <li>申请方式：纸质申请单 +OA 审批</li>
            <li>审批流程：部门经理→采购总监→财务</li>
          </ul>
        </div>
      </div>
    `, project)
  },

  generateRequirementSpec(project, date) {
    return this._generateGenericDoc('需求规格说明书', 'DOC-013', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 需求概述</div>
        <div class="doc-content">
          <p>本文档记录 ${project.company} SAP 项目的业务需求，作为后续方案设计和系统配置的依据。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 功能需求</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>模块</th><th>需求编号</th><th>需求描述</th><th>优先级</th></tr>
            <tr><td>FI</td><td>FI-001</td><td>实现多账套核算</td><td>高</td></tr>
            <tr><td>FI</td><td>FI-002</td><td>银企直连</td><td>高</td></tr>
            <tr><td>MM</td><td>MM-001</td><td>采购审批流程</td><td>高</td></tr>
            <tr><td>SD</td><td>SD-001</td><td>价格管理</td><td>中</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateFitGapAnalysis(project, date) {
    return this._generateGenericDoc('Fit-Gap 差异分析报告', 'DOC-014', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 分析概述</div>
        <div class="doc-content">
          <p>本报告分析 SAP 标准功能与 ${project.company} 业务需求的匹配度，识别差异并提出解决方案。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 差异汇总</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>序号</th><th>流程</th><th>需求</th><th>SAP 标准</th><th>差异</th><th>解决方案</th></tr>
            <tr><td>1</td><td>成本核算</td><td>按工序核算</td><td>按工单核算</td><td>部分匹配</td><td>增强开发</td></tr>
            <tr><td>2</td><td>销售定价</td><td>阶梯价格</td><td>支持</td><td>无</td><td>标准功能</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateToBeProcess(project, date) {
    return this._generateGenericDoc('TO-BE 业务流程设计文档', 'DOC-015', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 设计原则</div>
        <div class="doc-content">
          <p>基于 SAP 最佳实践，结合 ${project.company} 实际情况，设计未来业务流程。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 未来财务流程</div>
        <div class="doc-content">
          <h4>2.1 总账流程设计</h4>
          <ul>
            <li>凭证自动化：业务单据自动生成会计凭证</li>
            <li>实时结账：实现 T+1 结账</li>
          </ul>
        </div>
      </div>
    `, project)
  },

  generateBlueprintSignoff(project, date) {
    return this._generateGenericDoc('业务蓝图签字确认书', 'DOC-016', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 确认声明</div>
        <div class="doc-content">
          <p>本人已审阅业务蓝图文档，确认设计内容符合业务需求，同意按此方案进行系统实现。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 签字栏</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>模块</th><th>业务负责人</th><th>签字</th><th>日期</th></tr>
            <tr><td>FI/CO</td><td></td><td>______________</td><td></td></tr>
            <tr><td>MM</td><td></td><td>______________</td><td></td></tr>
            <tr><td>SD</td><td></td><td>______________</td><td></td></tr>
            <tr><td>PP</td><td></td><td>______________</td><td></td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateSystemConfiguration(project, date) {
    return this._generateGenericDoc('系统配置文档', 'DOC-017', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 组织架构配置</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>配置项</th><th>值</th><th>说明</th></tr>
            <tr><td>公司代码</td><td>1000</td><td>${project.company}</td></tr>
            <tr><td>工厂</td><td>1001,1002,1003</td><td>各工厂代码</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateDevelopmentSpec(project, date) {
    return this._generateGenericDoc('开发规格说明书', 'DOC-018', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 开发需求汇总</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>类型</th><th>编号</th><th>描述</th><th>优先级</th></tr>
            <tr><td>报表</td><td>RPT-001</td><td>销售分析报表</td><td>高</td></tr>
            <tr><td>表单</td><td>FRM-001</td><td>采购订单打印</td><td>高</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateDataMigrationPlan(project, date) {
    return this._generateGenericDoc('数据迁移方案', 'DOC-019', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 迁移策略</div>
        <div class="doc-content">
          <p>采用"先静态后动态、先主数据后交易数据"的原则进行数据迁移。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 迁移计划</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>数据类型</th><th>迁移时间</th><th>责任人</th></tr>
            <tr><td>组织数据</td><td>T-5 天</td><td>IT 部</td></tr>
            <tr><td>物料主数据</td><td>T-4 天</td><td>采购部</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateUnitTestReport(project, date) {
    return this._generateGenericDoc('单元测试报告', 'DOC-020', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 测试概述</div>
        <div class="doc-content">
          <p>单元测试由模块顾问执行，验证各功能点是否符合设计要求。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 测试结果</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>模块</th><th>测试用例</th><th>通过</th><th>失败</th><th>通过率</th></tr>
            <tr><td>FI</td><td>50</td><td>48</td><td>2</td><td>96%</td></tr>
            <tr><td>MM</td><td>60</td><td>58</td><td>2</td><td>97%</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateIntegrationTestReport(project, date) {
    return this._generateGenericDoc('集成测试报告', 'DOC-021', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 测试范围</div>
        <div class="doc-content">
          <p>集成测试覆盖跨模块端到端流程，包括采购到付款、销售到收款、计划到生产等。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 测试结果</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>流程</th><th>用例数</th><th>通过</th><th>失败</th></tr>
            <tr><td>采购到付款</td><td>25</td><td>24</td><td>1</td></tr>
            <tr><td>销售到收款</td><td>30</td><td>29</td><td>1</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateSecurityRoles(project, date) {
    return this._generateGenericDoc('权限矩阵与角色设计文档', 'DOC-022', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 角色设计</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>角色代码</th><th>角色名称</th><th>适用岗位</th></tr>
            <tr><td>ZFI_MGR</td><td>财务经理</td><td>财务经理</td></tr>
            <tr><td>ZFI_GL</td><td>总账会计</td><td>总账会计</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateUATReport(project, date) {
    return this._generateGenericDoc('UAT 测试报告', 'DOC-023', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. UAT 概述</div>
        <div class="doc-content">
          <p>用户验收测试由最终用户执行，验证系统是否满足业务需求。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 测试结果</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>模块</th><th>用例数</th><th>通过</th><th>失败</th><th>通过率</th></tr>
            <tr><td>FI</td><td>40</td><td>38</td><td>2</td><td>95%</td></tr>
            <tr><td>MM</td><td>45</td><td>44</td><td>1</td><td>98%</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateTrainingMaterial(project, date) {
    return this._generateGenericDoc('培训材料与考核记录', 'DOC-024', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 培训计划</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>课程</th><th>对象</th><th>课时</th><th>讲师</th></tr>
            <tr><td>FI 基础操作</td><td>财务人员</td><td>8</td><td>FI 顾问</td></tr>
            <tr><td>MM 基础操作</td><td>采购/仓储</td><td>8</td><td>MM 顾问</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateUserManual(project, date) {
    return this._generateGenericDoc('用户操作手册', 'DOC-025', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 手册说明</div>
        <div class="doc-content">
          <p>本手册为 ${project.company} SAP 系统最终用户提供操作指导。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 登录系统</div>
        <div class="doc-content">
          <p>1. 打开浏览器，访问 SAP 登录页面<br>
             2. 输入用户名和密码<br>
             3. 点击登录</p>
        </div>
      </div>
    `, project)
  },

  generateMasterDataImport(project, date) {
    return this._generateGenericDoc('主数据导入清单', 'DOC-026', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 数据清单</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>数据类型</th><th>记录数</th><th>状态</th><th>责任人</th></tr>
            <tr><td>物料主数据</td><td>5,000</td><td>待导入</td><td>采购部</td></tr>
            <tr><td>客户主数据</td><td>1,000</td><td>待导入</td><td>销售部</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateCutoverChecklist(project, date) {
    return this._generateGenericDoc('上线切换检查清单', 'DOC-027', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 切换前检查</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>检查项</th><th>责任人</th><th>状态</th></tr>
            <tr><td>数据备份完成</td><td>IT 部</td><td>□</td></tr>
            <tr><td>旧系统冻结</td><td>IT 部</td><td>□</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateCutoverPlan(project, date) {
    return this._generateGenericDoc('上线切换执行方案', 'DOC-028', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 切换策略</div>
        <div class="doc-content">
          <p>采用"大爆炸"切换方式，所有模块同时上线。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 切换时间表</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>时间</th><th>任务</th><th>责任人</th></tr>
            <tr><td>T-2 天</td><td>停止旧业务</td><td>各部门</td></tr>
            <tr><td>T-1 天</td><td>数据迁移</td><td>IT 部</td></tr>
            <tr><td>T 日</td><td>系统切换</td><td>项目组</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateContingencyPlan(project, date) {
    return this._generateGenericDoc('上线应急预案', 'DOC-029', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 应急组织</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>角色</th><th>人员</th><th>职责</th></tr>
            <tr><td>应急指挥</td><td>项目总监</td><td>决策是否回退</td></tr>
            <tr><td>技术组长</td><td>IT 经理</td><td>技术问题解决</td></tr>
          </table>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 回退条件</div>
        <div class="doc-content">
          <ul>
            <li>核心功能无法使用超过 24 小时</li>
            <li>关键数据丢失或错误</li>
          </ul>
        </div>
      </div>
    `, project)
  },

  generateGoLiveSignoff(project, date) {
    return this._generateGenericDoc('上线签字确认书', 'DOC-030', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 上线确认</div>
        <div class="doc-content">
          <p>确认 ${project.company} SAP 系统已完成切换，可以正式投入运行。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 签字栏</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>角色</th><th>姓名</th><th>签字</th><th>日期</th></tr>
            <tr><td>项目发起人</td><td></td><td>______________</td><td></td></tr>
            <tr><td>项目经理</td><td></td><td>______________</td><td></td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateIssueLog(project, date) {
    return this._generateGenericDoc('问题跟踪日志', 'DOC-031', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 问题汇总</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>编号</th><th>描述</th><th>优先级</th><th>状态</th><th>责任人</th></tr>
            <tr><td>ISS-001</td><td>凭证无法过账</td><td>P1</td><td>已解决</td><td>FI 顾问</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateSupportProcess(project, date) {
    return this._generateGenericDoc('运维支持流程文档', 'DOC-032', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 支持流程</div>
        <div class="doc-content">
          <p>用户报告问题 → Helpdesk 登记 → 分类派单 → 处理解决 → 用户确认 → 关闭</p>
        </div>
      </div>
    `, project)
  },

  generatePerformanceReport(project, date) {
    return this._generateGenericDoc('系统性能监控报告', 'DOC-033', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 性能指标</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>指标</th><th>目标值</th><th>实际值</th><th>状态</th></tr>
            <tr><td>响应时间</td><td><2 秒</td><td>1.5 秒</td><td>正常</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  generateHandoverDocument(project, date) {
    return this._generateGenericDoc('运维交接文档', 'DOC-034', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 交接内容</div>
        <div class="doc-content">
          <ul>
            <li>系统账号权限</li>
            <li>运维流程文档</li>
            <li>供应商联系方式</li>
          </ul>
        </div>
      </div>
    `, project)
  },

  generateProjectSummary(project, date) {
    return this._generateGenericDoc('项目总结报告', 'DOC-035', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 项目回顾</div>
        <div class="doc-content">
          <p>${project.name} 于 2026 年 5 月启动，2027 年 4 月成功上线，历时 11 个月。</p>
        </div>
      </div>
      <div class="doc-section">
        <div class="doc-section-title">2. 经验教训</div>
        <div class="doc-content">
          <ul>
            <li>高层支持是项目成功的关键</li>
            <li>充分的数据准备很重要</li>
          </ul>
        </div>
      </div>
    `, project)
  },

  generateAcceptanceReport(project, date) {
    return this._generateGenericDoc('验收报告', 'DOC-036', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 验收结论</div>
        <div class="doc-content">
          <p>项目已按计划完成所有交付物，系统运行稳定，同意验收。</p>
        </div>
      </div>
    `, project)
  },

  generateContinuousImprovement(project, date) {
    return this._generateGenericDoc('持续改进路线图', 'DOC-037', date, `
      <div class="doc-section">
        <div class="doc-section-title">1. 改进计划</div>
        <div class="doc-content">
          <table class="doc-table">
            <tr><th>阶段</th><th>内容</th><th>时间</th></tr>
            <tr><td>二期</td><td>CRM/SRM</td><td>2027 Q3</td></tr>
            <tr><td>三期</td><td>海外推广</td><td>2028 Q1</td></tr>
          </table>
        </div>
      </div>
    `, project)
  },

  // ============================================
  // 辅助方法
  // ============================================

  /**
   * 生成通用文档模板
   */
  _generateGenericDoc(title, docId, date, content, project) {
    return `
      <div class="doc-header">
        <div class="doc-title">${title}</div>
        <div class="doc-meta">
          <div>文档编号：${docId}-001</div>
          <div>版本号：V1.0</div>
          <div>编制日期：${date}</div>
          <div>编制单位：${project ? project.company : 'ERP 实施项目'}</div>
        </div>
      </div>
      ${content}
      <div class="doc-footer">
        <div class="signature-block">
          <div>编制人：______________</div>
          <div class="signature-line">日期</div>
        </div>
        <div class="signature-block">
          <div>审核人：______________</div>
          <div class="signature-line">日期</div>
        </div>
      </div>
    `;
  }
};

// 导出到全局
window.DocumentGenerator = DocumentGenerator;
