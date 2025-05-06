using System.Collections;
using UnityEngine;
using TMPro;

public class API : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI chatResponseText;
    [SerializeField] private AvatarEmotionController avatarEmotionController;

    // Simulated API request handling
    public IEnumerator SendChatRequest(string message)
    {
        // Simulate a delay for processing
        yield return new WaitForSeconds(1f);

        // Mocked response
        string simulatedReply = "Simulated reply for: " + message;
        chatResponseText.text = simulatedReply;

        // Simulate emotion vector
        float[] simulatedEmotionVector = new float[] { 0.8f, 0.2f, 0.1f, 0f, 0f, 0f, 0.1f, 0.9f };
        avatarEmotionController.UpdateAvatarExpression(simulatedEmotionVector);
    }
}