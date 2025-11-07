<script setup lang="ts">
import Inscription from '~/components/inscription.vue'

const { loggedIn, session, fetch, clear } = useUserSession()

const logout = async () => {
  await $fetch('/api/auth/logout')
  await fetch()
}
</script>

<template>
  <UDashboardPanel :ui="{ body: 'overflow-y-scroll' }">
    <template
      v-if="true"
      #header
    >
      <UDashboardNavbar>
        <template #right>
          <UColorModeSelect />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ClientOnly>
        <Inscription />
        <Login />
        {{ loggedIn }}
        <pre>{{ session }}</pre>
        <UButton @click="logout">
          Logout
        </UButton>
      </ClientOnly>
    </template>
    <template #footer>
      <UDashboardNavbar
        :toggle="false"
      >
        <UIcon name="lucide-home" />
      </UDashboardNavbar>
    </template>
  </UDashboardPanel>
</template>
