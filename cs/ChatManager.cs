using UnityEngine;
using TMPro;

public class ChatManager : MonoBehaviour
{
    [SerializeField] private TMP_InputField userInputField;
    [SerializeField] private API apiHandler;

    public void OnSendButtonClicked()
    {
        string userMessage = userInputField.text;
        StartCoroutine(apiHandler.SendChatRequest(userMessage));
    }
}