<template>
  <div id="employee-form">
    <form @submit.prevent="handleSubmit">
      <label>Employee name</label>
      <!-- <input type="text" /> -->
      <input
        ref="first"
        type="text"
        :class="{ 'has-error': submitting && invalidName }"
        v-model="employee.name"
        @focus="clearStatus"
        @keypress="clearStatus"
      />
      <label>Employee Email</label>
      <!-- <input type="text" /> -->
      <!-- <input v-model="employee.email" type="text" /> -->
      <input
        type="text"
        :class="{ 'has-error': submitting && invalidEmail }"
        v-model="employee.email"
        @focus="clearStatus"
        @keypress="clearStatus"
      />
      <p v-if="error && submitting" class="error-message">
        Please fill out all required fields.
      </p>
      <p v-if="success" class="success-message">
        Employee successfully added!
      </p>
      <button>Add Employee</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'employee-form',
  data() {
    return {
      submiting: false,
      error: false,
      success: false,
      employee: {
        name: '',
        email: '',
      },
    }
  },
  methods: {
    handleSubmit() {
      console.log('testing handleSubmit')
      this.submitting = true
      this.clearStatus()

      if (this.invalidName || this.invalidEmail) {
        this.error = true
        return
      }

      this.$emit('add:employee', this.employee)
      this.$refs.first.focus()
      this.employee = {
        name: '',
        email: '',
      }
      this.error = false
      this.success = true
      this.submitting = false
    },

    clearStatus() {
      this.success = false
      this.error = false
    }
  },
  computed: {
      invalidName() {
        return this.employee.name === ''
      },

      invalidEmail() {
        return this.employee.email === ''
      },
  },
}
//   export default {
//     name: 'employee-form',
//     data() {
//       return {
//         employee: {
//           name: '',
//           email: '',
//         },
//       }
//     },
//     methods: {
//         handleSubmit() {
//             console.log('testing handleSubmit')
//         },
//     },
//   }
</script>

<style scoped>
  form {
    margin-bottom: 2rem;
  }

  [class*='-message'] {
    font-weight: 500;
  }

  .error-message {
    color: #d33c40;
  }

  .success-message {
    color: #32a95d;
  }
</style>
