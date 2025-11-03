<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  pseudo: z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  pseudo: undefined,
  email: undefined,
  password: undefined,
  confirmPassword: undefined,
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $fetch('/api/register', {
    method: 'POST',
    body: {
      name: event.data.pseudo,
      email: event.data.email,
      password: event.data.password,
    },
  })
  toast.add({ title: 'Succès', description: 'Compte créé avec succès.', color: 'success' })
  console.log(event.data)
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField
      label="Pseudo"
      name="pseudo"
    >
      <UInput v-model="state.pseudo" />
    </UFormField>

    <UFormField
      label="Email"
      name="email"
    >
      <UInput
        v-model="state.email"
        type="email"
      />
    </UFormField>

    <UFormField
      label="Mot de passe"
      name="password"
    >
      <UInput
        v-model="state.password"
        type="password"
      />
    </UFormField>

    <UFormField
      label="Confirmer le mot de passe"
      name="confirmPassword"
    >
      <UInput
        v-model="state.confirmPassword"
        type="password"
      />
    </UFormField>

    <UButton type="submit">
      Créer un compte
    </UButton>
  </UForm>
</template>
