<script setup lang="ts">
const items = [[{
  label: 'Home',
  icon: 'i-lucide-house',
  active: true,
}, {
  label: 'Inbox',
  icon: 'i-lucide-inbox',
  badge: '4',
}, {
  label: 'Contacts',
  icon: 'i-lucide-users',
}, {
  label: 'Settings',
  icon: 'i-lucide-settings',
  defaultOpen: true,
}], [{
  label: 'Feedback',
  icon: 'i-lucide-message-circle',
  to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank',
}, {
  label: 'Help & Support',
  icon: 'i-lucide-info',
  to: 'https://github.com/nuxt/ui',
  target: '_blank',
}]]
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      collapsible
      resizable
    >
      <template #header>
        <UIcon
          name="lucide-home"
          size="2rem"
        />
      </template>
      <template #default>
        blabla
        <UNavigationMenu
          :items="items[0]"
          orientation="vertical"
        />
        <UNavigationMenu
          :items="items[1]"
          orientation="vertical"
          class="mt-auto"
        />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
