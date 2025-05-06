using UnityEngine;

public class SpatialAudioZone : MonoBehaviour
{
    [SerializeField] private AudioSource audioSource;

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
            audioSource.Play();
    }

    private void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Player"))
            audioSource.Stop();
    }

    public void PlayAudio()
    {
        if (!audioSource.isPlaying)
            audioSource.Play();
    }

    public void StopAudio()
    {
        if (audioSource.isPlaying)
            audioSource.Stop();
    }
}