<template>
  <div class="aspect-ratio-2/1 overflow-hidden bg-gray-900">
    <!-- Nav -->
    <div class="flex flex-row flex-nowrap space-x-2 p-2 bg-gray-800">
      <div v-for="i in 3" :key="i" class="w-12 h-2 rounded-full bg-gray-600" />
    </div>
    <!-- Video Content -->
    <div class="grid grid-cols-4 space-x-2 mx-2 mt-2">
      <div class="col-span-3">
        <!-- Video Title -->
        <div class="w-4/5 h-2 mb-1 rounded-full bg-gray-600" />
        <!-- Video Player -->
        <div class="aspect-ratio-16/9 rounded bg-gray-700" />
      </div>
      <div class="col-span-1">
        <!-- Video Author -->
        <div class="flex flex-row flex-nowrap space-x-1">
          <!-- Avatar -->
          <div class="w-3 h-3 rounded-full bg-gray-600" />
          <!-- Info -->
          <div class="flex-1 mt-0.5">
            <!-- Name -->
            <div class="w-4/5 h-1 rounded-full bg-gray-600" />
            <!-- Description -->
            <div class="mt-0.5 w-4/5 h-0.5 rounded-full bg-gray-600" />
          </div>
        </div>
        <!-- Recommendations -->
        <div class="mt-1">
          <div class="w-2/5 h-1 rounded-full bg-gray-600" />
          <div v-for="i in 6" :key="i" class="grid grid-cols-3 space-x-px mt-0.5">
            <!-- Cover -->
            <div class="col-span-1 aspect-ratio-16/10 bg-gray-700" />
            <!-- Info -->
            <div class="col-span-2 mt-px">
              <!-- Title -->
              <div class="w-4/5 h-1 rounded-full bg-gray-700" />
              <!-- Description -->
              <div class="mt-0.5 w-4/5 h-0.5 rounded-full bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
