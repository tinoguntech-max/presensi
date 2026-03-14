export function euclideanDistance(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) {
    return Number.MAX_VALUE;
  }

  let sum = 0;
  for (let i = 0; i < arr1.length; i += 1) {
    sum += (arr1[i] - arr2[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export function findBestMatch(inputDescriptor, employees, threshold = 0.5) {
  let bestMatch = null;
  let minDistance = Number.MAX_VALUE;

  for (const employee of employees) {
    if (!employee.face_descriptor) continue;

    let savedDescriptor;
    try {
      savedDescriptor = typeof employee.face_descriptor === 'string'
        ? JSON.parse(employee.face_descriptor)
        : employee.face_descriptor;
    } catch {
      continue;
    }

    const distance = euclideanDistance(inputDescriptor, savedDescriptor);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = employee;
    }
  }

  return {
    matched: minDistance <= threshold && bestMatch !== null,
    employee: minDistance <= threshold ? bestMatch : null,
    confidence: minDistance,
  };
}
