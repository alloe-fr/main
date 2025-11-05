<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, FormInputEvents } from '@nuxt/ui'

const schema = z.object({
  pseudo: z.string('Le pseudo est requis').min(3, 'Le pseudo doit contenir au moins 3 caractères'),
  email: z.email('Email invalide'),
  password: z.string('Le mot de passe est requis').min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string('La confirmation du mot de passe est requise').min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
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
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: event.data.pseudo,
        email: event.data.email,
        password: event.data.password,
      },
    })
    toast.add({ title: 'Succès', description: 'Compte créé avec succès.', color: 'success' })
  }
  catch (error) {
    console.error('erreur', error)
    toast.add({ title: 'Erreur', description: 'Une erreur est survenue lors de la création du compte.', color: 'error' })
  }
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    :validate-on="['input', 'change'] as FormInputEvents[]"
    @submit="onSubmit"
  >
    <UFormField
      label="Nom d'utilisateur"
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
        autocomplete="email"
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
