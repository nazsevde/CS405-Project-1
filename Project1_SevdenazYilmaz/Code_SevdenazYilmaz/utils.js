function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
        // you should paste the response of the chatGPT here:
        0.17677669, -0.28661165,  0.36959946,  0.3,
        0.30618623,  0.36959946,  0.14016505, -0.25,
       -0.70710677,  0.35355338,  0.61237246,  0.0,
        0.0,         0.0,         0.0,         1.0
    ]);
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
    // calculate the model view matrix by using the transformation
    // methods and return the modelView matrix in this method

        // Step 1: Define transformation parameters
        const translationX = 0.3;
        const translationY = -0.25;
        const translationZ = 0;
    
        const scaleX = 0.5;
        const scaleY = 0.5;
        const scaleZ = 1.0; // Scaling in z-axis as well
    
        const rotationXDegrees = 30; // degrees
        const rotationYDegrees = 45; // degrees
        const rotationZDegrees = 60; // degrees
    
        // Step 2: Create transformation matrices
        const translationMatrix = createTranslationMatrix(translationX, translationY, translationZ);
        const scaleMatrix = createScaleMatrix(scaleX, scaleY, scaleZ);
    
        // Convert degrees to radians and create rotation matrices
        const rotationMatrixX = createRotationMatrix_X(rotationXDegrees * (Math.PI / 180));
        const rotationMatrixY = createRotationMatrix_Y(rotationYDegrees * (Math.PI / 180));
        const rotationMatrixZ = createRotationMatrix_Z(rotationZDegrees * (Math.PI / 180));
    
        // Step 3: Combine the rotation matrices (Rz * (Ry * (Rx)))
        const rotationMatrixY_X = multiplyMatrices(rotationMatrixY, rotationMatrixX);
        const rotationMatrixR = multiplyMatrices(rotationMatrixZ, rotationMatrixY_X);
    
        // Step 4: Combine the scale and rotation matrices (S * R)
        const scalingRotationMatrix = multiplyMatrices(rotationMatrixR, scaleMatrix); // Note: Rotation first then scaling
    
        // Step 5: Combine the translation and scaling/rotation (T * M)
        const finalModelViewMatrix = multiplyMatrices(translationMatrix, scalingRotationMatrix);
    
        // Return the final model view matrix as a Float32Array
        return new Float32Array(finalModelViewMatrix);

}   

/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
function getPeriodicMovement(startTime) {
    // this metdo should return the model view matrix at the given time
    // to get a smooth animation

    // Step 1: Calculate the Model View Matrix (Task 2)
    const translationMatrix = createTranslationMatrix(0.3, -0.25, 0);
    const scaleMatrix = createScaleMatrix(0.5, 0.5, 1.0);
    const rotationMatrixX = createRotationMatrix_X(30 * (Math.PI / 180));
    const rotationMatrixY = createRotationMatrix_Y(45 * (Math.PI / 180));
    const rotationMatrixZ = createRotationMatrix_Z(60 * (Math.PI / 180));

    const rotationMatrixY_X = multiplyMatrices(rotationMatrixY, rotationMatrixX);
    const rotationMatrixR = multiplyMatrices(rotationMatrixZ, rotationMatrixY_X);
    const scalingRotationMatrix = multiplyMatrices(rotationMatrixR, scaleMatrix);
    const targetMatrix = multiplyMatrices(translationMatrix, scalingRotationMatrix); // Final target matrix

    // Step 2: Calculate current time and normalize it for a 10-second loop
    const animationTime = (Date.now() / 1000) % 10; // Time in seconds, looping every 10 seconds
    let progress;

    if (animationTime <= 5) {
        progress = animationTime / 5; // First 5 seconds
    } else {
        progress = 1 - ((animationTime - 5) / 5); // Next 5 seconds
    }

    // Step 3: Create the identity matrix (no transformation)
    const initialMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); // Identity matrix

    // Step 4: Interpolate between the identity matrix and the target matrix
    const interpolatedMatrix = initialMatrix.map((val, i) => (1 - progress) * val + progress * targetMatrix[i]);

    // Step 5: Return the interpolated matrix as a Float32Array
    return new Float32Array(interpolatedMatrix);
    
}



