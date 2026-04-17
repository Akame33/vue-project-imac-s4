<template>
    <nav class="tabs">
        <RouterLink to="/" class="tab-button">Flags List</RouterLink>
        <RouterLink to="/quiz" class="tab-button">Quiz</RouterLink>
    </nav>
</template>

<style scoped>
.tabs {
    display: flex;
    gap: 12px;
    margin: 20px 0 24px;
    flex-wrap: wrap;
}

.tab-button {
    text-decoration: none;
    border: none;
    border-radius: 12px;
    background: #d9d9d9;
    color: #222;
    padding: 12px 16px;
    font-size: 1rem;
}

.router-link-active {
    background: #313131;
    color: white;
}
</style>