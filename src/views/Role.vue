<template>
  <div class="role-manage">
    <div class="query-form">
      <el-form ref="form"
               :inline="true"
               :model="queryForm">
        <el-form-item label="角色名称"
                      prop="roleName">
          <el-input v-model="queryForm.roleName"
                    placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色状态"
                      prop="roleState">
          <el-select v-model="queryForm.roleState">
            <el-option :value="1"
                       label="正常"></el-option>
            <el-option :value="2"
                       label="停用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     @click="getRoleList">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary"
                   @click="handleAdd"
                   v-has="'role-create'">创建</el-button>
      </div>
      <el-table :data="roleList">
        <el-table-column v-for="item in columns"
                         :key="item.prop"
                         :prop="item.prop"
                         :label="item.label"
                         :width="item.width"
                         :formatter="item.formatter">
        </el-table-column>
        <el-table-column label="操作"
                         width="260">
          <template #default="scope">
            <el-button v-has="'role-edit'"
                       @click="handleEdit(scope.row)"
                       size="mini">编辑</el-button>
            <el-button size="mini"
                       type="primary"
                       @click="handleOpenPermission(scope.row)">设置权限</el-button>
            <el-button type="danger"
                       size="mini"
                       v-has="'role-delete'"
                       @click="handleDel(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pagination"
                     background
                     layout="prev, pager, next"
                     :total="pager.total"
                     :page-size="pager.pageSize"
                     @current-change="handleCurrentChange" />
    </div>
    <el-dialog title="角色新增"
               v-model="showModal">
      <el-form ref="dialogForm"
               :model="roleForm"
               label-width="100px"
               :rules="rules">
        <el-form-item label="角色名称"
                      prop="roleName">
          <el-input v-model="roleForm.roleName"
                    placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="备注"
                      prop="remark">
          <el-input type="textarea"
                    :rows="2"
                    v-model="roleForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary"
                     @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 权限 -->
    <el-dialog title="设置权限"
               v-model="showPermission">
      <el-form label-width="100px">
        <el-form-item label="角色名称">
          {{curRoleName}}
        </el-form-item>
        <el-form-item label="选择权限">
          <el-tree :data="menuList"
                   ref="permissionTree"
                   show-checkbox
                   default-expand-all
                   node-key="_id"
                   :props="{
                     label: 'menuName'
                   }">
          </el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPermission = false">取 消</el-button>
          <el-button type="primary"
                     @click="handlePermissionSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import utils from "../utils/utils";
export default {
  name: "role",
  data () {
    return {
      menuList: [],
      showPermission: false,
      curRoleName: '',
      curRoleId: '',
      queryForm: {
        roleName: '',
      },
      roleForm: {

      },
      action: '',
      pager: {
        pageNum: 1,
        pageSize: 10,
      },
      roleList: [],
      columns: [
        {
          label: "角色名称",
          prop: "roleName",
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "权限列表",
          width: 200,
          prop: "permissionList",
          formatter: (row, column, value) => {
            let names = []
            let list = value.halfCheckedKeys || []
            list.map(key => {
              let name = this.actionMap[key]
              if (key && name) names.push(name)
            })
            return names.join(',')
          }
        },
        {
          label: "创建时间",
          prop: "createTime",
          formatter: (row, column, value) => {
            return utils.formateDate(new Date(value));
          },
        },
      ],
      showModal: false,
      rules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名称",
            trigger: "blur",
          },
          {
            min: 2,
            max: 10,
            message: "长度在2-8个字符",
            trigger: "blur",
          },
        ],
      },
      actionMap: {

      }
    };
  },
  mounted () {
    this.getRoleList();
    this.getMenuList();
  },
  methods: {
    handleOpenPermission (row) {
      this.curRoleId = row._id
      this.curRoleName = row.roleName
      this.showPermission = true
      console.log(row)
      let { checkedKeys } = row.permissionList
      this.$nextTick(() => {
        this.$refs.permissionTree.setCheckedKeys(checkedKeys)
      })
    },
    // 设置权限
    async handlePermissionSubmit () {
      // 被勾选的
      let nodes = this.$refs.permissionTree.getCheckedNodes()
      // 半勾选中
      let halfKeys = this.$refs.permissionTree.getHalfCheckedKeys()
      // 区分按钮和菜单
      let checkedKeys = []
      let parentKeys = []
      nodes.map(node => {
        if (!node.children) { //按钮
          checkedKeys.push(node._id)
        } else {
          parentKeys.push(node._id) //菜单
        }
      })
      console.log(parentKeys);
      let params = {
        _id: this.curRoleId,
        permissionList: {
          // 只传选中的 子级 树节点即可,这样tree会自动根据勾选情况决定要不要全选或者半选父级
          //以前做的时候会把当前选中的子所有节点（父子）都传过去
          // 导致每次编辑打开都是全选中的状态 
          //只传选中的tree节点（没有children的）会自动划分半选中和全选中
          checkedKeys,
          // 为了用在 权限table列表 显示对应的权限
          halfCheckedKeys: parentKeys.concat(halfKeys)
        }
      }
      console.log(params);
      return
      await this.$api.updatePermission(params)
      this.showPermission = false
      this.$message.success('设置成功')
      this.getRoleList()
    },
    async getMenuList () {
      try {
        let list = await this.$api.getMenuList();
        this.menuList = list;
        this.getActionMap(list)
      } catch (e) {
        throw new Error(e);
      }
    },
    // 角色列表初始化
    async getRoleList () {
      try {
        let { list, page } = await this.$api.getRoleList({ ...this.queryForm, ...this.pager });
        this.roleList = list;
        this.pager.total = page.total
      } catch (e) {
        throw new Error(e);
      }
    },
    // 获取菜单映射表
    getActionMap (list) {
      let actionMap = {}
      const deep = (arr) => {
        while (arr.length) {
          let item = arr.pop()
          // 将按钮是最后一级的菜单保存  存在action
          if (item.children && item.action) {
            actionMap[item._id] = item.menuName
          }
          if (item.children && !item.action) {
            deep(item.children)
          }
        }
      }
      deep(JSON.parse(JSON.stringify(list)))
      this.actionMap = actionMap
    },
    // 分页
    handleCurrentChange (current) {
      this.pager.pageNum = current
      this.getRoleList();
    },
    // 表单重置
    handleReset (form) {
      this.$refs[form].resetFields();
    },
    // 新增角色
    handleAdd () {
      this.showModal = true;
      this.action = "create";
    },
    handleEdit (row) {
      this.showModal = true;
      this.action = "edit";
      this.$nextTick(() => {
        Object.assign(this.roleForm, row);
      });
    },
    async handleDel (_id) {
      await this.$api.roleOperate({ _id, action: "delete" });
      this.$message.success("删除成功");
      this.getRoleList();
    },
    // 角色提交
    handleSubmit () {
      this.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let { action, roleForm } = this;
          let params = { ...roleForm, action };
          let res = await this.$api.roleOperate(params);
          this.showModal = false;
          this.$message.success("创建成功");
          this.handleReset("dialogForm");
          this.getRoleList();
        }
      });
    },
    // 弹框关闭
    handleClose () {
      this.showModal = false;
      this.handleReset("dialogForm");
    },
  },
};
</script>

<style lang="scss">
</style>