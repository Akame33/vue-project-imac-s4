<template>
  <section class="quiz-card">
    <img :src="flagUrl" :alt="'Flag of ' + correctAnswer" class="flag-image" />

    <h2>A quel pays / etat appartient ce drapeau ?</h2>

    <div class="answers">
      <button
        v-for="option in options"
        :key="option"
        class="answer-button"
        :class="getButtonClass(option)"
        :disabled="answered"
        @click="$emit('select-answer', option)"
      >
        {{ option }}
      </button>
    </div>

    <p v-if="statusMessage" class="status-message">
      {{ statusMessage }}
    </p>

    <button v-if="answered" class="next-button" @click="$emit('next-question')">
      Question suivante
    </button>
  </section>
</template>

<script setup>
const props = defineProps({
  flagUrl: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  answered: {
    type: Boolean,
    required: true
  },
  selectedAnswer: {
    type: String,
    default: ""
  },
  statusMessage: {
    type: String,
    default: ""
  }
})

defineEmits(["select-answer", "next-question"])

function getButtonClass(option) {
  if (!props.answered) return ""

  if (option === props.correctAnswer) return "correct"
  if (option === props.selectedAnswer && option !== props.correctAnswer) {
    return "wrong"
  }

  return ""
}
</script>

<style scoped>
.quiz-card {
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.flag-image {
  width: 100%;
  max-width: 420px;
  height: 240px;
  object-fit: cover;
  display: block;
  margin: 0 auto 20px;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  background: #f7f7f7;
}

h2 {
  font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif ;
  margin: 0 0 20px;
  text-align: center;
}

.answers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.answer-button {
  padding: 14px;
  border: 1px solid #cfcfcf;
  border-radius: 12px;
  background: #f8f8f8;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.15s ease, background 0.15s ease;
}

.answer-button:hover:enabled {
  background: #efefef;
}

.answer-button.correct {
  background: #dcfce7;
  border-color: #16a34a;
}

.answer-button.wrong {
  background: #fee2e2;
  border-color: #dc2626;
}

.status-message {
  margin: 18px 0 0;
  text-align: center;
  font-weight: 600;
}

.next-button {
  display: block;
  margin: 18px auto 0;
  padding: 12px 18px;
  border: none;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

.next-button:hover {
  background: #1d4ed8;
}

@media (max-width: 640px) {
  .answers {
    grid-template-columns: 1fr;
  }

  .flag-image {
    height: 200px;
  }
}
</style>