<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  email: z.email('Email invalide'),
  password: z.string('Mot de passe requis').min(8, 'Doit contenir au moins 8 caractères'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: event.data.email,
        password: event.data.password,
      },
    })
    await useUserSession().fetch()
  }
  catch (error) {
    console.error('erreur', error)
  }
}

// TODO : gérer la dualité pseudo OU email pour le login
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField
      label="Email ou nom d'utilisateur"
      name="email"
      autocomplete="email"
    >
      <UInput v-model="state.email" />
    </UFormField>

    <UFormField
      label="Password"
      name="password"
    >
      <UInput
        v-model="state.password"
        type="password"
      />
    </UFormField>

    <UButton type="submit">
      Submit
    </UButton>
  </UForm>
</template>
