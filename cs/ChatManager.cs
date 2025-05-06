using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.XR;
using System.Collections;
using TMPro;

public class ChatManager : MonoBehaviour
{
    [SerializeField] private TMP_InputField userInputField;
    [SerializeField] private TextMeshProUGUI chatResponseText;
    [SerializeField] private AvatarEmotionController avatarEmotionController;

    private const string apiUrl = "https://api.perplexity.ai/chat";

    public void OnSendButtonClicked()
    {
        string userMessage = userInputField.text;
        StartCoroutine(SendChatRequest(userMessage));
    }

    private IEnumerator SendChatRequest(string message)
    {
        var json = JsonUtility.ToJson(new ChatRequest { query = message });
        var request = new UnityWebRequest(apiUrl, "POST");
        byte[] bodyRaw = new System.Text.UTF8Encoding().GetBytes(json);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        request.SetRequestHeader("Authorization", "Bearer YOUR_API_KEY");

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError("API Error: " + request.error);
            yield break;
        }

        ChatResponse response = JsonUtility.FromJson<ChatResponse>(request.downloadHandler.text);
        chatResponseText.text = response.reply;

        // Update avatar emotions
        avatarEmotionController.UpdateAvatarExpression(response.emotionVector);
    }

    [System.Serializable]
    private class ChatRequest { public string query; }

    [System.Serializable]
    private class ChatResponse
    {
        public string reply;
        public float[] emotionVector;
    }
}