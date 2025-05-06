using UnityEngine;

public class AvatarEmotionController : MonoBehaviour
{
    [SerializeField] private SkinnedMeshRenderer faceRenderer;
    [SerializeField] private string[] blendShapeNames;

    public void UpdateAvatarExpression(float[] emotionVector)
    {
        for (int i = 0; i < blendShapeNames.Length && i < emotionVector.Length; i++)
        {
            int index = faceRenderer.sharedMesh.GetBlendShapeIndex(blendShapeNames[i]);
            if (index >= 0)
                faceRenderer.SetBlendShapeWeight(index, emotionVector[i] * 100f);
        }
    }
}