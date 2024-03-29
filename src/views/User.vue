<template>
  <div>
    <div class="user-manage">
      <div class="query-form">
        <el-form ref="form"
                 :inline="true"
                 :model="user">
          <el-form-item label="用户ID"
                        prop="userId">
            <el-input v-model="user.userId"
                      placeholder="请输入用户ID" />
          </el-form-item>
          <el-form-item label="用户名称"
                        prop="userName">
            <el-input v-model="user.userName"
                      placeholder="请输入用户名称" />
          </el-form-item>
          <el-form-item label="状态"
                        prop="state">
            <el-select v-model="user.state">
              <el-option :value="0"
                         label="所有"></el-option>
              <el-option :value="1"
                         label="在职"></el-option>
              <el-option :value="2"
                         label="离职"></el-option>
              <el-option :value="3"
                         label="试用期"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
                       @click="handleQuery">查询</el-button>
            <el-button @click="handleReset('form')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="base-table">
        <div class="action">
          <el-button v-has="'user-create'"
                     type="primary"
                     @click="handleCreate">新增</el-button>
          <el-button v-has="'user-patch-delete'"
                     type="danger"
                     @click="handlePatchDel">批量删除</el-button>
        </div>
        <el-table :data="userList"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection"
                           width="55" />
          <el-table-column v-for="item in columns"
                           :key="item.prop"
                           :prop="item.prop"
                           :label="item.label"
                           :width="item.width"
                           :formatter="item.formatter">
          </el-table-column>
          <el-table-column label="操作"
                           width="150">
            <template #default="scope">
              <el-button v-has="'user-edit'"
                         @click="handleEdit(scope.row)"
                         size="mini">编辑</el-button>
              <el-button v-has="'user-delete'"
                         type="danger"
                         size="mini"
                         @click="handleDel(scope.row)">删除</el-button>
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
    </div>
    <el-dialog title="用户新增"
               v-model="showModal">
      <el-form ref="dialogForm"
               :model="userForm"
               label-width="100px"
               :rules="rules">
        <el-form-item label="用户名"
                      prop="userName">
          <el-input v-model="userForm.userName"
                    :disabled="action == 'edit'"
                    placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="邮箱"
                      prop="userEmail">
          <el-input v-model="userForm.userEmail"
                    :disabled="action == 'edit'"
                    placeholder="请输入用户邮箱">
            <template #append>@imooc.com</template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号"
                      prop="mobile">
          <el-input v-model="userForm.mobile"
                    placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="岗位"
                      prop="job">
          <el-input v-model="userForm.job"
                    placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="状态"
                      prop="state">
          <el-select v-model="userForm.state">
            <el-option :value="1"
                       label="在职"></el-option>
            <el-option :value="2"
                       label="离职"></el-option>
            <el-option :value="3"
                       label="试用期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系统角色"
                      prop="roleList">
          <el-select v-model="userForm.roleList"
                     placeholder="请选择用户系统角色"
                     multiple
                     style="width: 100%">
            <el-option v-for="role in roleList"
                       :key="role._id"
                       :label="role.roleName"
                       :value="role._id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门"
                      prop="deptId">
          <el-cascader v-model="userForm.deptId"
                       placeholder="请选择所属部门"
                       :options="deptList"
                       :props="{ checkStrictly: true, value: '_id', label: 'deptName' }"
                       clearable
                       style="width: 100%"></el-cascader>
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
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from 'vue'
import utils from "./../utils/utils";

export default {
  name: 'user',
  setup () {
    // 弹框
    const showModal = ref(false)
    // 获取Composition API 上下文对象
    const { proxy } = getCurrentInstance()
    // 初始化表单对象
    const user = reactive({
      state: 1,
    })
    // 初始化用户Form对象
    const userForm = reactive({
      state: 3,
    });
    // 选中用户列表对象
    const checkedUserIds = ref([]);
    // 列表数据
    const userList = ref([])
    // 所有角色列表
    const roleList = ref([]);
    // 所有部门列表
    const deptList = ref([]);
    // 定义用户操作行为
    const action = ref("add");
    // 初始化分页对象
    const pager = reactive({
      pageNum: 1,
      pageSize: 10,
    });
    // 定义表单校验规则
    const rules = reactive({
      userName: [
        {
          required: true,
          message: "请输入用户名称",
          trigger: "blur",
        },
      ],
      userEmail: [
        { required: true, message: "请输入用户邮箱", trigger: "blur" },
      ],
      mobile: [
        {
          pattern: /1[3-9]\d{9}/,
          message: "请输入正确的手机号格式",
          trigger: "blur",
        },
      ],
      deptId: [
        {
          required: true,
          message: "请输入用户邮箱",
          trigger: "blur",
        },
      ],
    })
    // table列
    const columns = reactive([
      {
        label: "用户ID",
        prop: "userId",
      },
      {
        label: "用户名",
        prop: "userName",
      },
      {
        label: "用户邮箱",
        prop: "userEmail",
      },
      {
        label: "用户角色",
        prop: "role",
        formatter (row, column, value) {
          return {
            0: "管理员",
            1: "普通用户",
          }[value];
        },
      },
      {
        label: "用户状态",
        prop: "state",
        formatter (row, column, value) {
          return {
            1: "在职",
            2: "离职",
            3: "试用期",
          }[value];
        },
      },
      {
        label: "注册时间",
        prop: "createTime",
        width: 180,
        formatter: (row, column, value) => {
          return utils.formateDate(new Date(value));
        },
      },
      {
        label: "最后登录时间",
        prop: "lastLoginTime",
        width: 180,
        formatter: (row, column, value) => {
          return utils.formateDate(new Date(value));
        },
      },
    ])
    // 获取用户列表
    const getUserList = async () => {
      let params = { ...user, ...pager }
      try {
        const { list, page } = await proxy.$api.getUserList(params)
        userList.value = list
        pager.total = page.total
      } catch (error) {
        console.log(error);
      }
    }
    // 查询
    const handleQuery = () => {
      getUserList();
    }
    // 重置查询表单
    const handleReset = (form) => {
      proxy.$refs[form].resetFields();
    }
    // 新增
    const handleCreate = () => {
      showModal.value = true;
    }
    // 批量删除
    const handlePatchDel = async () => {
      if (checkedUserIds.value.length === 0) {
        proxy.$message.error("请选择要删除的用户");
        return;
      }
      try {
        await proxy.$api.userDel({
          userIds: checkedUserIds.value
        })
        proxy.$message.success('删除成功')
        getUserList()
      } catch (error) {

      }
    }
    // 编辑
    const handleEdit = (row) => {
      action.value = "edit";
      showModal.value = true;
      proxy.$nextTick(() => {
        Object.assign(userForm, row);
      });
    }
    // 删除
    const handleDel = async (row) => {
      try {
        await proxy.$api.userDel({
          userIds: [row.userId]
        })
        proxy.$message.success('删除成功')
        getUserList()
      } catch (error) {

      }
    }
    // 确定
    const handleSubmit = async () => {
      proxy.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          let params = toRaw(userForm);
          params.userEmail += "@imooc.com";
          params.action = action.value;
          let res = await proxy.$api.userSubmit(params);
          showModal.value = false;
          proxy.$message.success("用户创建成功");
          handleReset("dialogForm");
          getUserList();
        }
      });
    }
    // 取消
    const handleClose = async () => {
      showModal.value = false;
      handleReset("dialogForm");
    }
    // 表格多选
    const handleSelectionChange = (list) => {
      let arr = [];
      list.map((item) => {
        arr.push(item.userId);
      });
      checkedUserIds.value = arr;
    }
    const getDeptList = async () => {
      let list = await proxy.$api.getDeptList();
      deptList.value = list;
    };

    // 角色列表查询
    const getRoleAllList = async () => {
      let list = await proxy.$api.getRoleAllList();
      roleList.value = list;
    };
    // 页码变化
    const handleCurrentChange = (current) => {
      pager.pageNum = current
      getUserList();
    }
    onMounted(() => {
      getUserList()
      getDeptList();
      getRoleAllList();
    })
    return {
      user,
      userList,
      showModal,
      columns,
      pager,
      roleList,
      deptList,
      action,
      userForm,
      checkedUserIds,
      rules,
      handleClose,
      handleSubmit,
      getUserList,
      handleQuery,
      handleReset,
      handleCreate,
      handlePatchDel,
      handleEdit,
      handleDel,
      handleCurrentChange,
      handleSelectionChange
    }
  }
}
</script>

<style lang="scss" scoped>
</style>